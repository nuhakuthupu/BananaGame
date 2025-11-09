import { db, auth } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

export async function saveScore(timeUsed) {
    const user = auth.currentUser;

    if (!user) {
        alert("Please login to save your score!");
        return;
    }

    try {
        await addDoc(collection(db, "leaderboard"), {
            uid: user.uid,           
            name: user.displayName || user.email.split("@")[0],
            score: Number(timeUsed),
            created: serverTimestamp()
        });
        console.log("✅ Score saved with UID!");
    } catch (e) {
        console.error("Error saving score:", e);
    }
}
