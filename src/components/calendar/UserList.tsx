'use client';

import React, { useEffect, useState } from 'react';
import { FaUser } from 'react-icons/fa';

interface UsersListProps {
  activeUserId: string | null;
  setActiveUserId: (id: string) => void;
}

const UsersList: React.FC<UsersListProps> = ({ activeUserId, setActiveUserId }) => {
  const [users, setUsers] = useState<{ id: string; name: string | null; role: string }[]>([]);
  
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/group');
        const data = await response.json();
if (Array.isArray(data?.users)) {
          const fullUsersList = [...data.users];

          setUsers(fullUsersList);
        } else {
          console.error('Нет пользователей в группе:', data);
        }
      } catch (error) {
        console.error('Ошибка загрузки пользователей группы:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (users.length > 0 && !activeUserId) {
      setActiveUserId(users[0].id);
    }
  }, [users, activeUserId]);

  return (
    <div className="w-full bg-white p-4 rounded-b-lg  overflow-hidden">
      <div className="overflow-x-auto whitespace-nowrap scrollbar-hide">
        <ul className="flex space-x-4 px-2 animate-slide-in">
          {users.length > 0 ? (
            users.map((user) => (
              <li
                key={user.id}
                onClick={() => setActiveUserId(user.id)}
                className={`flex items-center space-x-2 p-3 rounded-lg shadow transition cursor-pointer
                  ${activeUserId === user.id ? 'bg-blue-100 border border-blue-500' : 'bg-gray-100 hover:bg-gray-200'}
                `}
              >
                <FaUser className="text-gray-700 text-lg" />
                <span className="text-sm font-semibold text-gray-800">
                  {user.role === 'admin' ? 'Я' : user.name || 'Без имени'}
                </span>
              </li>
            ))
          ) : (
            <p className="text-gray-500 text-center w-full">Нет пользователей</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default UsersList;