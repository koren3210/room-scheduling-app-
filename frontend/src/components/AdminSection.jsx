import { Trash2 } from 'lucide-react';
import Modal from './Modal';
import { useState } from 'react';

const AMENITIES = [
	'Whiteboard',
	'Quiet Room',
	'Projector',
	'Video Conference',
	'TV Screen',
	'Big Room',
	'Small Room',
	'Standing Desk',
];

export default function AdminSection({ adminRooms, onAddRoom, onDeleteRoom }) {
	const [selectedRoom, setSelectedRoom] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedAmenities, setSelectedAmenities] = useState([]);

	const handleAmenityToggle = amenity => {
		setSelectedAmenities(curr => (curr.includes(amenity) ? curr.filter(a => a !== amenity) : [...curr, amenity]));
	};

	const handleFormSubmit = e => {
		e.preventDefault();
		onAddRoom(e);
		setSelectedAmenities([]);
	};

	const handleDeleteClick = room => {
		setSelectedRoom(room);
		setIsModalOpen(true);
	};

	const handleModalAction = action => {
		if (action === 'approve' && selectedRoom) {
			onDeleteRoom(selectedRoom.id);
		}
		setIsModalOpen(false);
		setSelectedRoom(null);
	};

	return (
		<div className='flex flex-col gap-6'>
			{/* Registration form */}
			<div className='bg-white/80 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] p-8 rounded-2xl shadow-sm'>
				<h3 className='text-base font-bold mb-6 text-slate-900 dark:text-white'>Register Workspace</h3>
				<form onSubmit={handleFormSubmit} className='space-y-4'>
					<input
						type='text'
						name='name'
						required
						className='w-full bg-slate-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-siemens-petrol focus:ring-1 focus:ring-siemens-petrol transition-all'
						placeholder='Room Name'
					/>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<input
							type='number'
							name='capacity'
							required
							className='w-full bg-slate-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-siemens-petrol focus:ring-1 focus:ring-siemens-petrol transition-all'
							placeholder='Seats'
						/>
						<select
							name='wing'
							className='w-full bg-slate-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-siemens-petrol transition-all appearance-none'
						>
							<option>Wing B</option>
							<option>Wing C</option>
							<option>Wing D</option>
						</select>
					</div>

					<div>
						<label className='block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2'>
							Room image (optional)
						</label>
						<input
							type='file'
							name='image'
							className='w-full bg-slate-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-siemens-petrol focus:ring-1 focus:ring-siemens-petrol transition-all'
						/>
					</div>

					<div>
						<label className='block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2'>Amenities</label>
						<div className='flex flex-wrap gap-2'>
							{AMENITIES.map(amenity => (
								<button
									type='button'
									key={amenity}
									onClick={() => handleAmenityToggle(amenity)}
									className={`px-2 py-1 rounded-lg border text-xs transition-colors duration-100 font-bold uppercase tracking-widest ${
										selectedAmenities.includes(amenity)
											? 'bg-siemens-petrol text-white border-siemens-petrol'
											: 'bg-white dark:bg-slate-900 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-200'
									}`}
								>
									{amenity}
								</button>
							))}
						</div>
					</div>

					{/* Hidden input to pass amenities via FormData */}
					<input type='hidden' name='amenitiesJson' value={JSON.stringify(selectedAmenities)} />

					<button
						type='submit'
						className='w-full bg-siemens-petrol text-white rounded-xl px-4 py-3 text-sm font-bold hover:bg-siemens-petrol-dark focus:outline-none focus:ring-2 focus:ring-siemens-petrol focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-black transition-all'
					>
						Add Room
					</button>
				</form>
			</div>

			{/* Room list */}
			<div className='bg-white/80 dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.06] p-8 rounded-2xl shadow-sm'>
				<h3 className='text-base font-bold mb-6 text-slate-900 dark:text-white'>Manage Rooms</h3>
				<div className='space-y-4'>
					{adminRooms.map(room => (
						<div
							key={room.id}
							className='flex items-center justify-between bg-slate-50 dark:bg-white/[0.04] border border-black/[0.08] dark:border-white/[0.06] rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white'
						>
							<div>
								<h4 className='font-bold'>{room.name}</h4>
								<div className='mt-1.5 flex flex-wrap gap-1'>
									{room.amenities.map(tag => (
										<span
											key={tag}
											className='text-[9px] bg-black/[0.04] dark:bg-white/[0.06] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.04] uppercase tracking-wider font-bold'
										>
											{tag}
										</span>
									))}
								</div>
							</div>
							<button
								className='text-rose-400 hover:text-rose-600 hover:scale-110 transition-all p-1 ml-4 shrink-0'
								onClick={() => handleDeleteClick(room)}
							>
								<Trash2 className='w-4 h-4' />
								<span className='sr-only'>Delete {room.name}</span>
							</button>
						</div>
					))}
				</div>
			</div>

			{/* Modal */}
			{isModalOpen && (
				<Modal
					title='Confirm Deletion'
					message={`Are you sure you want to delete the room "${selectedRoom?.name}"?`}
					onApprove={() => handleModalAction('approve')}
					onDecline={() => handleModalAction('decline')}
				/>
			)}
		</div>
	);
}
