import { useState } from 'react';
import {
	Box,
	Typography,
	TextField,
	Button,
	Paper,
	Alert,
	CircularProgress,
	Divider,
	Chip,
	Stack,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
} from '@mui/material';
import { CloudUpload, Add, FileUpload } from '@mui/icons-material';
import { useApi } from '../context/ApiContext';
import { useUser } from '../context/UserContext';
import Layout from '../components/Layout';

export default function UploadPage() {
	const { api } = useApi();
	const { currentUser } = useUser();
	const [singleName, setSingleName] = useState('');
	const [origin, setOrigin] = useState('');
	const [meaning, setMeaning] = useState('');
	const [gender, setGender] = useState<'masculine' | 'feminine' | 'neutral'>('neutral');
	const [loading, setLoading] = useState(false);
	const [fileLoading, setFileLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [uploadedNames, setUploadedNames] = useState<string[]>([]);

	const showMessage = (message: string, isError = false) => {
		if (isError) {
			setErrorMessage(message);
			setSuccessMessage('');
		} else {
			setSuccessMessage(message);
			setErrorMessage('');
		}
		setTimeout(() => {
			setSuccessMessage('');
			setErrorMessage('');
		}, 5000);
	};

	const handleSingleNameSubmit = async () => {
		if (!currentUser || !singleName.trim()) return;

		setLoading(true);
		try {
			await api.addName(
				currentUser.id,
				singleName.trim(),
				origin,
				meaning,
				gender,
			);
			setUploadedNames((prev) => [...prev, singleName.trim()]);
			showMessage(`Successfully added "${singleName.trim()}"!`);
			setSingleName('');
			setOrigin('');
			setMeaning('');
			setGender('neutral');
		} catch (error) {
			console.error('Failed to add name:', error);
			showMessage('Failed to add name. Please try again.', true);
		} finally {
			setLoading(false);
		}
	};

	const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file || !currentUser) return;

		if (!file.name.endsWith('.txt')) {
			showMessage('Please upload a .txt file.', true);
			return;
		}

		setFileLoading(true);
		try {
			const text = await file.text();
			const names = text
				.split('\n')
				.map((name) => name.trim())
				.filter((name) => name.length > 0);

			if (names.length === 0) {
				showMessage('No valid names found in the file.', true);
				return;
			}

			const addedIds = await api.addNames(currentUser.id, names);
			const addedNames = names.slice(0, addedIds.length);
			setUploadedNames((prev) => [...prev, ...addedNames]);

			if (addedIds.length === names.length) {
				showMessage(`Successfully added ${addedIds.length} names!`);
			} else {
				showMessage(
					`Added ${addedIds.length} out of ${names.length} names. Some may have been duplicates.`,
				);
			}
		} catch (error) {
			console.error('Failed to upload file:', error);
			showMessage('Failed to upload file. Please try again.', true);
		} finally {
			setFileLoading(false);
			// Reset the file input
			event.target.value = '';
		}
	};

	return (
		<Layout title="Upload Names" showBackButton>
			<Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
				{/* Success/Error Messages */}
				{successMessage && (
					<Alert severity="success" sx={{ mb: 3 }}>
						{successMessage}
					</Alert>
				)}
				{errorMessage && (
					<Alert severity="error" sx={{ mb: 3 }}>
						{errorMessage}
					</Alert>
				)}

				{/* Single Name Upload */}
				<Paper sx={{ p: 3, mb: 3 }}>
					<Typography
						variant="h5"
						gutterBottom
						sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
					>
						<Add />
						Add Single Name
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						Propose a new last name for consideration. You can add optional details to help others
						understand the name's background.
					</Typography>

					<Stack spacing={2}>
						<TextField
							label="Name"
							value={singleName}
							onChange={(e) => setSingleName(e.target.value)}
							fullWidth
							placeholder="e.g., Martinez"
							required
						/>

						<TextField
							label="Origin (Optional)"
							value={origin}
							onChange={(e) => setOrigin(e.target.value)}
							fullWidth
							placeholder="e.g., Spanish"
						/>

						<TextField
							label="Meaning (Optional)"
							value={meaning}
							onChange={(e) => setMeaning(e.target.value)}
							fullWidth
							placeholder="e.g., Son of Martin"
						/>

						<FormControl fullWidth>
							<InputLabel>Gender Association</InputLabel>
							<Select
								value={gender}
								label="Gender Association"
								onChange={(e) => setGender(e.target.value as 'masculine' | 'feminine' | 'neutral')}
							>
								<MenuItem value="neutral">Neutral</MenuItem>
								<MenuItem value="masculine">Masculine</MenuItem>
								<MenuItem value="feminine">Feminine</MenuItem>
							</Select>
						</FormControl>

						<Button
							variant="contained"
							onClick={handleSingleNameSubmit}
							disabled={!singleName.trim() || loading}
							startIcon={loading ? <CircularProgress size={20} /> : <Add />}
							size="large"
						>
							{loading ? 'Adding...' : 'Add Name'}
						</Button>
					</Stack>
				</Paper>

				<Divider sx={{ my: 3 }} />

				{/* File Upload */}
				<Paper sx={{ p: 3, mb: 3 }}>
					<Typography
						variant="h5"
						gutterBottom
						sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
					>
						<CloudUpload />
						Upload from File
					</Typography>
					<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
						Upload a .txt file with one name per line. This is perfect for bulk uploads of name
						lists.
					</Typography>

					<Box sx={{ textAlign: 'center' }}>
						<input
							accept=".txt"
							style={{ display: 'none' }}
							id="file-upload"
							type="file"
							onChange={handleFileUpload}
							disabled={fileLoading}
						/>
						<label htmlFor="file-upload">
							<Button
								variant="outlined"
								component="span"
								startIcon={fileLoading ? <CircularProgress size={20} /> : <FileUpload />}
								disabled={fileLoading}
								size="large"
								sx={{ py: 2, px: 4 }}
							>
								{fileLoading ? 'Uploading...' : 'Choose .txt File'}
							</Button>
						</label>

						<Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
							Example file format:
							<br />
							<code>
								Smith
								<br />
								Johnson
								<br />
								Williams
							</code>
						</Typography>
					</Box>
				</Paper>

				{/* Recently Uploaded Names */}
				{uploadedNames.length > 0 && (
					<Paper sx={{ p: 3 }}>
						<Typography variant="h6" gutterBottom>
							Recently Added Names ({uploadedNames.length})
						</Typography>
						<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
							{uploadedNames.slice(-20).map((name, index) => (
								<Chip key={index} label={name} variant="outlined" color="primary" />
							))}
							{uploadedNames.length > 20 && (
								<Chip label={`+${uploadedNames.length - 20} more`} variant="outlined" />
							)}
						</Box>
					</Paper>
				)}

				{/* Info Box */}
				<Alert severity="info" sx={{ mt: 3 }}>
					<Typography variant="body2">
						<strong>💡 Pro tip:</strong> Names you upload will appear first when swiping, giving
						them priority over the default name list. This ensures your personalized suggestions get
						seen first!
					</Typography>
				</Alert>
			</Box>
		</Layout>
	);
}
