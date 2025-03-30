"use client"
import { useState, useEffect } from "react";
import { useAppSession } from "@/entities/session/use-app-session";
import { useRouter } from "next/navigation";
import SidebarLayout from "../../layout/SidebarLayout";
import { FaCopy, FaPlus, FaTrash, FaUserEdit, FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import CustomSelect from "@/components/custom/CustomSelect";

interface User {
  id: string;
  name: string;
  role: string;
  online: boolean;
  login: string;
  password?: string;
}

const roles = [
  { id: "admin", name: "Администратор" },
  { id: "manager", name: "Менеджер" },
  { id: "user", name: "Пользователь" },
];

const GroupPage = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editableUser, setEditableUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupName, setGroupName] = useState("Загрузка группы...");
  const [groupId, setGroupId] = useState("Загрузка...");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", login: "", password: "", role: "Пользователь" });
  const [showPassword, setShowPassword] = useState(false);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  const session = useAppSession();
  const router = useRouter();
 
  useEffect(() => {
    if (session.status === "loading") return;
    if (session.data?.user.role !== "admin") {
      router.push("/"); // или другая страница
    }
  }, [session.status, session.data?.user.role]);

  useEffect(() => {
    setEditableUser(selectedUser);
  }, [selectedUser]);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        console.log("🔄 Получаем группу с пользователями...");
        const res = await fetch("/api/group");
        const group = await res.json();

        if (group?.name) setGroupName(group.name);
        if (group?.id) setGroupId(group.id);
        if (group?.users) setUsers(group.users);

        setEditableUser(group.users?.[1] ?? null);
        setSelectedUser(group.users?.[1] ?? null);

        console.log("🔐 Пользователи группы:", group);
      } catch (error) {
        console.error("❌ Ошибка при получении группы:", error);
      }
    };

    if (session.status === "authenticated" && session.data?.user.role === "admin") {
      fetchGroup();
    }
  }, [session.status, session.data?.user.role]);

  const handleCopyGroupId = () => {
    navigator.clipboard.writeText(groupId);
    setCopyMessage("ID группы скопирован!");
    setTimeout(() => setCopyMessage(null), 2000);
  };

  const handleSaveGroupName = async () => {
    try {
      const res = await fetch("/api/group", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: groupName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Ошибка при обновлении названия группы");

      console.log("✅ Название группы успешно обновлено:", data);
    } catch (error) {
      console.error("❌ Ошибка при обновлении названия группы:", error);
    }
  };

  const filteredUsers = users
    .filter((user) => user.id !== session.data?.user.id) // исключаем админа
    .filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreateUser = async () => {
    console.log("Создан новый пользователь:", newUser);
    try {
      const res = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...newUser, groupId }),
      });
  
      const data = await res.json();
  
      if (!res.ok) throw new Error(data.message || "Ошибка при создании пользователя");
  
      console.log("✅ Пользователь создан:", data);
      setIsModalOpen(false);
      const createdUser = {
        ...data,
        login: data.accounts?.[0]?.providerAccountId ?? newUser.login,
        password: "", // очищаем для формы
        role: data.role,
        online: false,
      };
      setUsers((prev) => [...prev, createdUser]);
      setSelectedUser(createdUser);
      setEditableUser(createdUser);
    } catch (error) {
      console.error("❌ Ошибка при создании пользователя:", error);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(newUser.password);
    setCopyMessage("Пароль скопирован!");
    setTimeout(() => setCopyMessage(null), 2000);
  };

  if (session.status === "loading") return null;

  return (
    <SidebarLayout>
      <div className="p-6">
      {copyMessage && (
        <div
          className="fixed bg-gray-900 text-white px-4 py-2 rounded-md shadow-md transition-opacity duration-500 z-50"
          style={{ bottom: "20px", right: "20px" }} // 👈 Принудительно задаем координаты
        >
          {copyMessage}
        </div>
      )}
        {/* Верхний блок: Информация о группе */}
        <div className="flex items-center justify-between bg-blue-100 p-4 rounded-lg shadow-md mb-6">
          <div>
            <h1 className="text-2xl font-semibold">{groupName}</h1>
            <p className="text-sm text-gray-600">
              ID группы: <span className="font-mono">{groupId}</span>
              <button onClick={handleCopyGroupId} className="ml-2 text-gray-700 hover:text-gray-900">
                <FaCopy />
              </button>
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="border border-gray-300 p-2 rounded-md text-sm"
              placeholder="Изменить название группы"
            />
            <button
              onClick={() => handleSaveGroupName()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Сохранить
            </button>
          </div>
        </div>

        <div className="flex gap-6 items-start h-max">
          {/* Левая колонка: Список пользователей */}
          <div className="w-1/3 min-w-[260px] max-w-[300px] bg-white shadow-md rounded-lg p-4 flex-shrink-0 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
            <div className="flex justify-between items-center mb-4 flex-col ">
              <h2 className="text-lg font-semibold text-gray-800">Пользователи</h2>
              <button
                className="flex items-center gap-2 px-4 py-2 border border-blue-500 text-blue-600 font-medium rounded-md hover:bg-blue-100 transition-all shadow-sm"
                onClick={() => setIsModalOpen(true)}
              >
                <FaPlus className="w-5 h-5" />
                <span className="font-semibold">Добавить</span>
              </button>
            </div>
            <input
              type="text"
              className="w-full p-2 mb-4 border border-gray-300 rounded-md"
              placeholder="Поиск..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="grid gap-4">
              {filteredUsers.map((user) => (
                <button
                  key={user.id}
                  className={`w-full flex justify-between p-4 rounded-md shadow-sm transition hover:bg-gray-200 ${
                    selectedUser?.id === user.id ? "bg-gray-100 border-l-4 border-blue-500" : "bg-white"
                  }`}
                  onClick={() => {
                    setSelectedUser(user);
                    setEditableUser(user);
                  }}
                >
                  <span
                  
                  >{user.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Правая колонка: Управление пользователем */}
          <div className="flex-1 bg-gray-50 p-6 border border-gray-300 rounded-lg shadow-sm" style={{ height: "max-content" }}>
            <h2 className="text-lg font-medium mb-4 text-gray-700">Детали пользователя</h2>
            {editableUser ? (
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600">Имя</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={editableUser?.name ?? ""}
                    onChange={(e) => setEditableUser({ ...editableUser!, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">Логин</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={editableUser?.login ?? ""}
                    onChange={(e) => setEditableUser({ ...editableUser!, login: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">Пароль</label>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full p-2 border-none rounded-md"
                      placeholder="Введите новый пароль"
                      onChange={(e) => setEditableUser({ ...editableUser!, password: e.target.value })}
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="p-2 hover:bg-gray-100 rounded-md">
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button onClick={handleCopyPassword} className="p-2 hover:bg-gray-100 rounded-md">
                      <FaCopy />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">Роль</label>
                  <CustomSelect
                    options={roles}
                    value={roles.find((role) => role.id === editableUser?.role) || null}
                    onChange={(selected) => setEditableUser({ ...editableUser!, role: String(selected.id) })}
                    placeholder="Выберите роль"
                  />
                </div>

                <div className="flex justify-between gap-3">
                  <button className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 font-medium flex items-center " onClick={async () => {
                    console.log("✅ Изменения сохранены:", editableUser);
                    setSelectedUser(editableUser);
                    if (editableUser?.password) {
                      await fetch("/api/users/password", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          userId: editableUser.id,
                          newPassword: editableUser.password,
                        }),
                      });
                    }
                  }}>
                    <FaUserEdit className="w-5 h-5" /> Сохранить изменения
                  </button>
                  <button className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 font-medium flex items-center " onClick={() => {
                    setIsConfirmOpen(true);
                  }}>
                    <FaTrash className="w-5 h-5" /> Удалить пользователя
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Выберите пользователя для редактирования.</p>
            )}
          </div>
        </div>

        {/* Модальное окно для создания пользователя */}
        {isModalOpen && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs flex justify-center items-center animate-fadeIn">
          <div className="relative bg-white p-6 rounded-2xl w-[350px] shadow-lg">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 p-2 rounded-full transition-all hover:bg-gray-200"
              onClick={() => setIsModalOpen(false)}
            >
              <FaTimes className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center pt-5">Создать нового пользователя</h2>
        
            <input
              type="text"
              placeholder="Имя"
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Логин"
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
              onChange={(e) => setNewUser({ ...newUser, login: e.target.value })}
            />
            <input
              type="password"
              placeholder="Пароль"
              className="w-full p-3 mb-3 border border-gray-300 rounded-lg focus:ring focus:ring-blue-300"
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            />
            <CustomSelect
              options={roles}
              value={roles.find((role) => role.id === newUser.role) || null}
              onChange={(selected) => setNewUser({ ...newUser, role: String(selected.id) })}
              placeholder="Выберите роль"
            />
            <div 
              className="flex gap-5 pt-5"
            >

            <button
              className="bg-gray-400 hover:bg-gray-700 text-white py-3 px-4 rounded-lg w-full shadow-md transition-all"
              onClick={() => setIsModalOpen(false)}
            >
              Отменить
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg w-full shadow-md transition-all"
              onClick={handleCreateUser}
            >
              Создать
            </button>
            </div>
          </div>
        </div>
        )}

        {isConfirmOpen && (
          <div className="absolute inset-0 bg-black/30 backdrop-blur-xs flex justify-center items-center animate-fadeIn z-50">
            <div className="relative bg-white p-6 rounded-2xl w-[350px] shadow-lg">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 p-2 rounded-full transition-all hover:bg-gray-200"
                onClick={() => setIsConfirmOpen(false)}
              >
                <FaTimes className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Удалить пользователя</h2>
              <p className="text-gray-600 mb-6">
                Вы уверены, что хотите удалить пользователя <strong>{editableUser?.name}</strong>?
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="px-4 py-2 rounded-md bg-gray-300 hover:bg-gray-400 text-gray-800"
                  onClick={() => setIsConfirmOpen(false)}
                >
                  Отмена
                </button>
                <button
                  className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white"
                  onClick={async () => {
                    if (!editableUser) return;
                    try {
                      const res = await fetch("/api/group", {
                        method: "DELETE",
                        headers: {
                          "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ userId: editableUser.id }),
                      });
                      const result = await res.json();
                      if (!res.ok) throw new Error(result.error || "Ошибка при удалении пользователя");
                      setUsers((prev) => prev.filter((u) => u.id !== editableUser.id));
                      setEditableUser(null);
                      setSelectedUser(null);
                      setIsConfirmOpen(false);
                      console.log("🗑️ Пользователь успешно удалён");
                    } catch (err) {
                      console.error("❌ Ошибка при удалении пользователя:", err);
                    }
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default GroupPage;