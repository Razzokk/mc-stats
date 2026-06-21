export function ticksToTime(ticks: number) {
	const seconds = Math.floor(ticks / 20);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);

	let time = "";

	if (days > 0) time += `${days}d `;
	if (hours > 0) time += `${hours % 24}h `;
	if (minutes > 0) time += `${minutes % 60}m `;
	time += `${seconds % 60}s`;

	return time;
}
