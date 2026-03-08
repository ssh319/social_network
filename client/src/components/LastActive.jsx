import CircleIcon from "@assets/icons/CircleIcon";


const LastActive = ({ lastActive }) => {

    const formatDate = (value) => {
        if (!value) return;

        const monthsList = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ]

        const date = new Date(value);
        
        return `${date.getDate()} ${monthsList[date.getMonth()]} ${date.getFullYear()}`
    }

    return (
        <div style={{ color: 'var(--bs-gray-600)', fontSize: '12px' }}>
            {Date.now() - new Date(lastActive) > 1000 * 60 * 3 ?
                `Last active: ${formatDate(lastActive)}, ${new Date(lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` :
                <span><CircleIcon color='green' /> Online</span>
            }
        </div>
    );
}


export default LastActive;
