'use client'
import Avatar from './avatar'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import PasswordForm from '@/components/PasswordForm/PasswordForm'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"

function DisplayField({
    label,
    value,
    onEdit,
}: {
    label: string;
    value: string | null;
    onEdit: () => void;
}) {
    return (
        <div className="flex justify-between items-center py-3 profile-section">
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="font-medium">{value || "Not set"}</p>
            </div>
            <button
                onClick={onEdit}
                className="text-sm underline text-primary hover:opacity-80"
            >
                Edit
            </button>
        </div>
    )
}

function EditNameDialog({ open, setOpen, editField, fullname, setFullname, username, setUsername, units, setUnits }: any) {
    const [newValue, setNewValue] = useState<string>("");
    useEffect(() => {
        if (!open) return;

        if (editField === "full name") setNewValue(fullname ?? "");
        else if (editField === "username") setNewValue(username ?? "");
        else if (editField === "units") setNewValue(units ?? "");
    }, [open, editField, fullname, username, units]);

    function onSave() {
        if (editField === "full name") setFullname(newValue);
        else if (editField === "username") setUsername(newValue);
        else if (editField === "units") setUnits(newValue);

        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit {editField}</DialogTitle>
                </DialogHeader>
                {editField === "full name" || editField === "username" ?

                    <div>
                        <input
                            className="search-input p-2"
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                        />

                    </div>

                    :

                    <div>
                        <Select value={newValue} onValueChange={setNewValue}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="units" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                }
                <DialogFooter>
                    <button onClick={() => setOpen(false)}>Cancel</button>
                    <button onClick={() => onSave()}>Save</button>
                </DialogFooter>
            </DialogContent>
        </Dialog >
    )
}

export default function ProfileForm({ user }: { user: User | null }) {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [fullname, setFullname] = useState<string | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [avatar_url, setAvatarUrl] = useState<string | null>(null);
    const [units, setUnits] = useState<string | null>(null);
    const [hasPassword, setHasPassword] = useState<boolean>(false);
    const [editField, setEditField] = useState<string | null>(null); // to specify which field we're trying to edit

    const [editName, setEditName] = useState<boolean>(false);
    const [editUsername, setEditUsername] = useState<boolean>(false);

    // uses supabase rpc to check if user already has a password set
    async function checkUserHasPassword(userId: string): Promise<boolean> {
        const { data, error } = await supabase.rpc("user_has_password", { user_id: userId })

        if (error) {
            console.error("Error checking password existence:", error)
            return false
        }

        return data
    }

    const getProfile = useCallback(async () => {
        try {
            setLoading(true);

            const { data, error, status } = await supabase
                .from('profiles')
                .select(`full_name, username, avatar_url, units`)
                .eq('id', user?.id)
                .single();

            if (error && status !== 406) {
                console.log(error);
                throw error;
            }

            if (data) {
                console.log()
                setFullname(data.full_name);
                setUsername(data.username);
                setAvatarUrl(data.avatar_url);
                setUnits(data.units);

            }

            if (user) {
                checkUserHasPassword(user.id).then((res) => setHasPassword(res));
                console.log(`hasPassword: ${hasPassword}`);
            }

        } catch (error) {
            console.error("Error loading user account.", error);
            alert('Error loading user data!');
        } finally {
            setLoading(false);
        }
    }, [user, supabase])

    useEffect(() => {
        getProfile();
    }, [user, getProfile])

    async function updateProfile({
        fullname,
        username,
        avatar_url,
        units
    }: {
        fullname: string | null
        username: string | null
        avatar_url: string | null
        units: string | null
    }) {
        try {
            setLoading(true)

            const { error } = await supabase.from('profiles').upsert({
                id: user?.id as string,
                full_name: fullname,
                username,
                avatar_url,
                units,
                updated_at: new Date().toISOString(),
            })
            if (error) throw error
            alert('Profile updated!')
        } catch (error) {
            alert('Error updating the data!')
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="form-widget flex flex-col gap-8">
            <h1 className="font-semibold mt-8">Edit profile</h1>

            {/* Avatar Section */}
            <div className="flex items-center gap-4">
                <Avatar
                    uid={user?.id ?? null}
                    url={avatar_url}
                    size={75}
                    onUpload={(url) => {
                        setAvatarUrl(url)
                        updateProfile({ fullname, username, avatar_url: url, units })
                    }}
                />
            </div>

            {/* Profile Info Section */}
            <h2 className="font-medium">Personal Info and Preferences</h2>

            <div className="flex justify-between items-center py-3 profile-section">
                <div>
                    <p className="text-sm text-muted-foreground">Full name</p>
                    <p className="font-medium">{fullname || "Not set"}</p>
                </div>
                <button
                    onClick={() => {
                        setEditName(true)
                        setEditField("full name")
                    }}
                    className="text-sm underline text-primary hover:opacity-80"
                >
                    Edit
                </button>
            </div>

            <div className="flex justify-between items-center py-3 profile-section">
                <div>
                    <p className="text-sm text-muted-foreground">Username</p>
                    <p className="font-medium">{username || "Not set"}</p>
                </div>
                <button
                    onClick={() => {
                        setEditName(true)
                        setEditField("username")
                    }}
                    className="text-sm underline text-primary hover:opacity-80"
                >
                    Edit
                </button>
            </div>

            <div className="flex justify-between items-center py-3 profile-section">
                <div>
                    <p className="text-sm text-muted-foreground">Units</p>
                    <p className="font-medium">{units == "lbs" ? "Pounds (lbs)" : "Kilograms (kg)"}</p>
                </div>
                <button
                    onClick={() => {
                        setEditName(true)
                        setEditField("units")
                    }}
                    className="text-sm underline text-primary hover:opacity-80"
                >
                    Edit
                </button>
            </div>
            <PasswordForm user={user} hasPassword={hasPassword} />



            <div className="flex justify-end">
                <button
                    className="button w-30"
                    onClick={() => updateProfile({ fullname, username, avatar_url, units })}
                >
                    Save
                </button>
            </div>

            <EditNameDialog
                open={editName}
                setOpen={setEditName}
                editField={editField}
                fullname={fullname}
                setFullname={setFullname}
                username={username}
                setUsername={setUsername}
                units={units}
                setUnits={setUnits}
            />

        </div>

    )
}
