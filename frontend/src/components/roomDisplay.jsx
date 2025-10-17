import React, { useState, useMemo, useRef, useEffect } from 'react';
import RoomList from '../../../backend/data/roomList.json'; 
import '../css/roomDisplay.css';

const augmentedRoomList = RoomList.map((room, index) => ({
    ...room,
    roomPrice: 200 + index * 50
}));

export default function BoxDisplay() {
    // Start with no room selected
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const scrollRef = useRef(null);

    const selectedRoom = useMemo(() => 
        augmentedRoomList.find(room => room.roomId === selectedRoomId), 
        [selectedRoomId]
    );

    const handleRoomClick = (roomId) => {
        setSelectedRoomId(currentId => {
            // If the same room is clicked again, return null to deselect everything.
            if (currentId === roomId) {
                return null;
            }
            // Otherwise, select the new room.
            return roomId;
        });
    };

    // Effect to smooth-scroll the carousel
    useEffect(() => {
        if (scrollRef.current && selectedRoomId) {
            const selectedElement = scrollRef.current.querySelector(`.room-item[data-id="${selectedRoomId}"]`);
            if (selectedElement) {
                const scrollContainerWidth = scrollRef.current.offsetWidth;
                const elementWidth = selectedElement.offsetWidth;
                const elementOffset = selectedElement.offsetLeft;

                scrollRef.current.scroll({
                    left: elementOffset - (scrollContainerWidth / 2) + (elementWidth / 2),
                    behavior: 'smooth'
                });
            }
        }
    }, [selectedRoomId]);
    
    //deskripsi room
    const DetailCard = ({ room }) => (
        <div className="bg-[#102e50] text-white w-full h-full p-8 md:p-10 rounded-xl flex flex-col justify-between">
            <div>
                <h2 className="text-2xl font-bold mb-1 text-white">{room.roomName}</h2>
                <p className="text-sm text-gray-400 mb-6">{room.roomBed}</p>
                <p className="text-sm text-gray-400 mb-6">{room.roomDesc}</p>
            </div>

            <div className="pt-5 border-t border-[#34495e] flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-sm text-gray-400">Price / night</span>
                    <span className="text-4xl font-extrabold text-yellow-500">${room.roomPrice}</span>
                </div>
                
            </div>
        </div>
    );
    
    return (
        <div className="bg-[#fbfaf9]">            
            <div className="overflow-hidden px-[10vw]">
                <div 
                    className="flex space-x-8 overflow-x-scroll pb-6 no-scrollbar"
                    ref={scrollRef}
                >
                    {augmentedRoomList.map(room => {
                        const isSelected = room.roomId === selectedRoomId;

                        return (
                            <div 
                                key={room.roomId}
                                data-id={room.roomId}
                                className={`
                                    room-item 
                                    relative flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer 
                                    shadow-xl transition-all duration-500 ease-in-out
                                    ${isSelected
                                        ? 'w-[480px] h-[400px] shadow-2xl shadow-gray-900/40' 
                                        : 'w-[250px] h-[350px] opacity-100 hover:-translate-y-2 hover:opacity-80' 
                                    }
                                `}
                                onClick={() => handleRoomClick(room.roomId)} 
                            >
                                <img 
                                    src={room.roomImage} 
                                    alt={room.roomName} 
                                    className={`
                                        w-full h-full object-cover transition-opacity duration-500
                                        ${isSelected ? 'opacity-10' : 'opacity-100'} // Dim image when selected
                                    `}
                                />
                                
                                {/* Info overlay */}
                                <div className="absolute inset-x-0 bottom-0 p-4 text-white bg-gradient-to-t from-black/80 to-transparent">
                                    <span className="font-bold text-lg block">{room.roomName}</span>
                                    <span className="text-sm">{room.roomBed.split(' • ')[0]}</span>
                                </div>

                                {/* Conditional Rendering of the Big Detail Card */}
                                {isSelected && (
                                    <div className="absolute inset-0 p-5 flex justify-center items-center z-10">
                                        <DetailCard room={room} />
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}