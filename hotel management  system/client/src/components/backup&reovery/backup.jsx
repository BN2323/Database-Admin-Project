import { useEffect, useState } from "react";
import axios from "axios";

function cronToHuman(cron) {
  // Very simple parser for 5-part cron (min hour dom mon dow)
  // Example: "0 2 * * *" => "Every day at 2:00 AM"
  // Expand this as needed or use a library
  if (!cron) return "No schedule set";

  const parts = cron.trim().split(" ");
  if (parts.length !== 5) return "Invalid schedule";

  const [min, hour, dom, mon, dow] = parts;

  if (dom === "*" && mon === "*" && dow === "*") {
    return `Every day at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  }
  if (dow !== "*") {
    return `Every week on day ${dow} at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  }
  if (dom !== "*") {
    return `Every month on day ${dom} at ${hour.padStart(2, "0")}:${min.padStart(2, "0")}`;
  }
  return cron; // fallback
}

function humanToCron({ frequency, hour, minute, dayOfWeek, dayOfMonth }) {
  // Convert form fields to cron string
  // Simplified:  
  if (frequency === "daily") return `${minute} ${hour} * * *`;
  if (frequency === "weekly") return `${minute} ${hour} * * ${dayOfWeek}`;
  if (frequency === "monthly") return `${minute} ${hour} ${dayOfMonth} * *`;
  return "";
}

export default function BackupManager() {
  const [files, setFiles] = useState([]);
  const [currentSchedule, setCurrentSchedule] = useState("");
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [backupInProgress, setBackupInProgress] = useState(false);
  const [restoreInProgress, setRestoreInProgress] = useState(null);
  const [scheduleUpdating, setScheduleUpdating] = useState(false);

  // For human-friendly schedule form
  const [frequency, setFrequency] = useState("daily");
  const [hour, setHour] = useState("2");
  const [minute, setMinute] = useState("0");
  const [dayOfWeek, setDayOfWeek] = useState("0"); // Sunday
  const [dayOfMonth, setDayOfMonth] = useState("1");

  const fetchFiles = async () => {
    try {
      setLoadingFiles(true);
      const res = await axios.get("http://localhost:5000/api/backup/files");
      setFiles(res.data.files);
    } catch (error) {
      alert("Failed to fetch backup files.");
      console.error(error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const fetchSchedule = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/backup/schedule");
      const cron = res.data.schedule;

      setCurrentSchedule(cron);

      // Parse cron to form fields (only support 3 frequencies here)
      if (!cron) return;
      const parts = cron.trim().split(" ");
      if (parts.length !== 5) return;

      const [min, hr, dom, mon, dow] = parts;
      setHour(hr);
      setMinute(min);

      if (dom === "*" && mon === "*" && dow === "*") setFrequency("daily");
      else if (dow !== "*") {
        setFrequency("weekly");
        setDayOfWeek(dow);
      } else if (dom !== "*") {
        setFrequency("monthly");
        setDayOfMonth(dom);
      }
    } catch (error) {
      alert("Failed to fetch schedule.");
      console.error(error);
    }
  };

  const triggerBackup = async () => {
    if (backupInProgress) return;
    try {
      setBackupInProgress(true);
      await axios.post("http://localhost:5000/api/backup");
      alert("Backup started!");
      await fetchFiles();
    } catch (error) {
      alert("Failed to start backup.");
      console.error(error);
    } finally {
      setBackupInProgress(false);
    }
  };

  const updateSchedule = async () => {
    if (scheduleUpdating) return;
    try {
      setScheduleUpdating(true);
      const cron = humanToCron({ frequency, hour, minute, dayOfWeek, dayOfMonth });
      await axios.post("http://localhost:5000/api/backup/schedule", { schedule: cron });
      setCurrentSchedule(cron);
      alert("Schedule updated!");
    } catch (error) {
      alert("Failed to update schedule.");
      console.error(error);
    } finally {
      setScheduleUpdating(false);
    }
  };

  const triggerRestore = async (file) => {
    if (restoreInProgress) return;
    const confirmRestore = window.confirm(
      `Are you sure you want to restore the database from "${file}"? This will overwrite current data.`
    );
    if (!confirmRestore) return;

    try {
      setRestoreInProgress(file);
      await axios.post("http://localhost:5000/api/backup/restore", { file });
      alert(`Restore from "${file}" started.`);
    } catch (error) {
      alert("Failed to restore backup.");
      console.error(error);
    } finally {
      setRestoreInProgress(null);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchSchedule();
  }, []);

  return (
    <div className="flex flex-col items-center w-full bg-[#002335] text-white">
        <div className='w-full primary-col border-b border-black flex items-center justify-between px-4 py-2.5 sticky top-0 z-50'>
            <div className='w-full text-center font-bold'>Database Backup Manager</div>

            <button
            onClick={triggerBackup}
            disabled={backupInProgress}
            className={`whitespace-nowrap bg-blue-900 text-[12px] py-3 px-10 rounded-[5px] border-2 font-bold border-blue-950 cursor-pointer hover:border-blue-500 hover:bg-blue-800 text-white ${
            backupInProgress ? "bg-gray-400 cursor-not-allowed" : ""
            }`}
            >
                {backupInProgress ? "Backing up..." : "+ Backup"}
            </button>
        </div>
        <div className="p-4 w-[700px] mx-auto">
        

        <div className="mb-6 border px-8 pt-4 pb-8 rounded primary-col w-full">
            <h3 className="font-semibold mb-2">Schedule Backup</h3>

            <p className="mb-2">
            Current schedule: <strong>{cronToHuman(currentSchedule)}</strong>
            </p>

            <label className="block mb-1 font-medium">Frequency:</label>
            <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="mb-3 p-2 border rounded w-full bg-[#0F4A72] text-white"
            >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            </select>

            <label className="block mb-1 font-medium">Time:</label>
            <div className="flex space-x-2 mb-3">
            <input
                type="number"
                min="0"
                max="23"
                value={hour}
                onChange={(e) => setHour(e.target.value)}
                className="w-1/2 p-2 border rounded"
            />
            <input
                type="number"
                min="0"
                max="59"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="w-1/2 p-2 border rounded"
            />
            </div>

            {frequency === "weekly" && (
            <>
                <label className="block mb-1 font-medium">Day of Week:</label>
                <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="mb-3 p-2 border rounded w-full bg-[#0F4A72] text-white"
                >
                <option value="0">Sunday</option>
                <option value="1">Monday</option>
                <option value="2">Tuesday</option>
                <option value="3">Wednesday</option>
                <option value="4">Thursday</option>
                <option value="5">Friday</option>
                <option value="6">Saturday</option>
                </select>
            </>
            )}

            {frequency === "monthly" && (
            <>
                <label className="block mb-1 font-medium">Day of Month:</label>
                <input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                className="mb-3 p-2 border rounded w-full"
                />
            </>
            )}

            <button
            onClick={updateSchedule}
            disabled={scheduleUpdating}
            className={`w-full px-4 py-2 rounded text-white border mt-4 border-green-600 ${
                scheduleUpdating ? "bg-gray-400 cursor-not-allowed" : " bg-green-700 hover:bg-green-600  hover:border-green-300"
            }`}
            >
            {scheduleUpdating ? "Updating..." : "Update Schedule"}
            </button>
        </div>

        <h3 className="text-lg font-semibold mb-2">Available Backups</h3>
        {loadingFiles ? (
            <p>Loading backup files...</p>
        ) : files.length === 0 ? (
            <p>No backup files found.</p>
        ) : (
            <ul className="space-y-2 w-full ">
            {files.map((file, idx) => (
                <li
                key={idx}
                className="border p-3 rounded flex justify-between items-center w-full hover:bg-[#002639]"
                >
                <a
                    href={`http://localhost:5000/download/${file}`}
                    download
                    className="hover:text-blue-700 underline break-words"
                >
                    {file}
                </a>
                <button
                    disabled={!!restoreInProgress}
                    onClick={() => triggerRestore(file)}
                    className={`px-3 py-1 rounded text-white ${
                    restoreInProgress
                        ? "bg-gray-400 cursor-not-allowed"
                        : "border border-red-600 bg-red-700 hover:bg-red-600  hover:border-red-300"
                    }`}
                >
                    {restoreInProgress === file ? "Restoring..." : "Restore"}
                </button>
                </li>
            ))}
            </ul>
        )}
        </div>
    </div>
  );
}
