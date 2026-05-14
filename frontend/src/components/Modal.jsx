export default function Modal({ title, message, onApprove, onDecline }) {
	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
			<div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-96'>
				<h2 className='text-lg font-bold text-gray-900 dark:text-white'>{title}</h2>
				<p className='mt-4 text-sm text-gray-600 dark:text-gray-300'>{message}</p>
				<div className='mt-6 flex justify-end gap-4'>
					<button
						onClick={onDecline}
						className='px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600'
					>
						Decline
					</button>
					<button onClick={onApprove} className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700'>
						Approve
					</button>
				</div>
			</div>
		</div>
	);
}
