export const mockRecommendations = [
	{
		id: 'r1',
		name: 'Alpha Pod',
		wing: 'Wing A',
		capacity: 4,
		amenities: ['Whiteboard', 'Quiet Zone'],
		score: 98,
		image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=80',
	},
	{
		id: 'r2',
		name: 'Beta Lab',
		wing: 'Wing B',
		capacity: 12,
		amenities: ['Smart Board', 'Big Screen'],
		score: 92,
		image: 'https://images.unsplash.com/photo-1598016462719-756184586f56?auto=format&fit=crop&w=700&q=80',
	},
	{
		id: 'r3',
		name: 'Innovation Hub',
		wing: 'Wing C',
		capacity: 20,
		amenities: ['Telepresence'],
		score: 85,
		image: 'https://images.unsplash.com/photo-1505409859467-3a796fd5798e?auto=format&fit=crop&w=700&q=80',
	},
	{
		id: 'r4',
		name: 'Design Studio',
		wing: 'Wing D',
		capacity: 6,
		amenities: ['Dual Screens', 'Whiteboard'],
		score: 82,
		image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=700&q=80',
	},
];

export const mockRooms = [
	{
		id: '1',
		name: 'Conference A',
		wing: 'Wing A',
		status: 'available',
		capacity: 12,
		amenities: ['Whiteboard', 'Telepresence'],
	},
	{
		id: '2',
		name: 'Automation Pod',
		wing: 'Wing B',
		status: 'occupied',
		capacity: 4,
		until: '2:00 PM',
		amenities: ['Quiet Zone'],
	},
	{
		id: '3',
		name: 'Advanta Room',
		wing: 'Wing C',
		status: 'available',
		capacity: 8,
		amenities: ['Smart Board'],
	},
];

export const mockBookings = [
	{
		id: 'b1',
		title: 'Project Delta Sync',
		time: '09',
		period: 'AM',
		wing: 'Wing B · Beta Lab',
		status: 'confirmed',
		attendees: 6,
		date: 'Today',
	},
	{
		id: 'b2',
		title: 'Customer Review',
		time: '11',
		period: 'AM',
		wing: 'Wing A · Conference A',
		status: 'pending',
		attendees: 4,
		date: 'Today',
	},
];

export const mockAdminRooms = [
	{
		id: 'a1',
		name: 'North Wing Huddle',
		wing: 'Wing A',
		amenities: ['Whiteboard', 'Dual Screens'],
	},
	{
		id: 'a2',
		name: 'Beta Studio',
		wing: 'Wing B',
		amenities: ['Telepresence', 'Smart Board'],
	},
];

export const initialMessages = [
	{
		id: 'm1',
		role: 'assistant',
		text: "Hello there. I'm connected to the APC site sensors. Wings A-D are active. Ask me to find a room, check amenities, or draft invites.",
	},
];
