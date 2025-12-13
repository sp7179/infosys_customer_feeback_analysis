"use client"
export default function ProfileView({ profile, onEdit, onClose }) {
    return (
        <div className="text-white space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-purple-300">Profile</h2>
                <button onClick={onClose} className="text-gray-400 hover:text-red-400">✖ Close</button>
            </div>

            <div className="flex flex-col items-center mt-2">
                <img
                    src={profile.photo || "/default-avatar.png"}
                    alt="profile"
                    className="w-28 h-28 rounded-full border-2 border-purple-400 object-cover"
                />
                <p className="mt-2 text-lg font-medium">{profile.fullName || "No Name"}</p>
                <p className="text-sm text-gray-400">@{profile.userid}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Info label="Display Name" value={profile.displayName} />
                <Info label="Email" value={profile.email} />
                <Info label="Phone" value={profile.phone} />
                <Info label="City" value={profile.city} />
                <Info label="Website" value={profile.website} />
                <Info label="Bio" value={profile.bio} />
            </div>

            <div className="flex justify-end mt-4">
                <button
                    onClick={onEdit}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
                >
                    Edit
                </button>
            </div>
        </div>
    )
}

const Info = ({ label, value }) => (
    <div>
        <p className="text-gray-400">{label}</p>
        <p className="text-white">{value || "—"}</p>
    </div>
)
