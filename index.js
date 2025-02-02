
    import confetti from 'https://cdn.skypack.dev/canvas-confetti';
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
    import { getFirestore, collection, addDoc, getDocs, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
    import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


    const firebaseConfig = {
     

    };
    
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      const auth = getAuth(app);
    

    let sessionId = new URLSearchParams(window.location.search).get("session") || sessionStorage.getItem("sessionId");
    let userId = null;
    let username = sessionStorage.getItem("username") || null;
    let senderUsername = null;

    document.addEventListener("DOMContentLoaded", async function () {
    const yesButton = document.getElementById('yesButton');
    const noButton = document.getElementById('noButton');
    const imageDisplay = document.getElementById('imageDisplay');
    const valentineQuestion = document.getElementById('valentineQuestion');
    const responseButtons = document.getElementById('responseButtons');
    const sessionInfo = document.getElementById('sessionInfo');
    const responsesList = document.getElementById('responsesList');
    const responseSection = document.getElementById('responseSection');
    const shareLinkContainer = document.getElementById('shareLinkContainer');
    const createSessionBtn = document.getElementById('createSessionBtn');

    // ✅ Sign in Anonymously to Track User
    signInAnonymously(auth).catch(error => console.error("Auth Error:", error));

    onAuthStateChanged(auth, async (user) => {
      if (user) {
        userId = user.uid;
        console.log("User session:", userId);

        // If no session exists, create a new one
        if (!sessionId) {
          sessionInfo.textContent = `No match's link found! Create a new one.`;
          createSessionBtn.classList.remove("hidden");
          responseButtons.style.display = "none";
        } else if (sessionId === sessionStorage.getItem("sessionId")){
          sessionInfo.textContent = `Match's Link Created! Share this:`;
          responseButtons.style.display = "none";
          createSessionBtn.classList.add("hidden");
          shareLinkContainer.innerHTML = `
            <input id="shareLink" class="border p-2" value="${window.location.href}?session=${sessionId}" readonly />
            <button id="copyLink" class="ml-2 bg-pink-500 text-white px-3 py-1 rounded">Copy</button>
          `;
          document.getElementById("copyLink").addEventListener("click", () => {
            navigator.clipboard.writeText(document.getElementById("shareLink").value);
            alert("Link copied!");
          });
        }
         else {
          if(sessionStorage.getItem(sessionId)){
            responseButtons.style.display="none"
            valentineQuestion.textContent="Hmmm, you have already Answered 😒"
            createSessionBtn.style.display="block"
          }
          // sessionInfo.textContent = `You joined session: ${sessionId}`;
          responseSection.style.display = "none";
          
          await fetchSessionById();
          await fetchResponses();
        }

        // Get Username
        if (!username) {
          username = prompt("Enter your name:");
          if (!username) {
            username = `Guest_${Math.floor(Math.random() * 1000)}`;
          }
          sessionStorage.setItem("username", username);
        }

        // Display existing responses
        await fetchResponses();
      }
    });

    // ✅ Create a New Session
    createSessionBtn.addEventListener("click",async () => {
      const sessionRef = await addDoc(collection(db, "valentine_sessions"), { creatorId: userId, createdAt: new Date(), username });
      const newSessionId = sessionRef.id;
      sessionStorage.setItem("sessionId", newSessionId);
      sessionInfo.textContent = `Match's Link Created! Share it:`;
      createSessionBtn.classList.add("hidden");
      shareLinkContainer.innerHTML = `
        <input id="shareLink" class="border p-2" value="${window.location.href}?session=${newSessionId}" readonly />
        <button id="copyLink" class="ml-2 bg-pink-500 text-white px-3 py-1 rounded">Copy</button>
      `;
      document.getElementById("copyLink").addEventListener("click", () => {
        navigator.clipboard.writeText(document.getElementById("shareLink").value);
        alert("Link copied!");
      });
      return newSessionId;
    });

    const fetchSessionById = async () => {
      if (!sessionId) return;

      try {
        const sessionDoc = await getDoc(doc(db, "valentine_sessions", sessionId));
        
        if (sessionDoc.exists()) {
          const sessionData = sessionDoc.data();
          senderUsername = sessionData.username;
          document.getElementById("sessionInfo").textContent = `${sessionData.username} says...`;
        } else {
          document.getElementById("sessionInfo").textContent = `Match link not found!`;
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        document.getElementById("sessionInfo").textContent = `Error loading match link!`;
      }
    };


    // ✅ Fetch Responses
    const fetchResponses = async () => {
      responsesList.innerHTML = "";
      const q = query(collection(db, "valentine_responses"), where("sessionId", "==", sessionId));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        const { username, response } = doc.data();
        const tr = document.createElement("tr");
        tr.className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200";
        tr.innerHTML = `
                        <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            ${username}
                        </th>
                        <td class="px-6 py-4">
                             ${response}
                        </td>`;
        responsesList.appendChild(tr);
      });
    };

    // ✅ Save Response to Firestore
    const saveResponse = async (response) => {
      if (!sessionId || !userId) return;
      await addDoc(collection(db, "valentine_responses"), { sessionId, userId, username, response, timestamp: new Date() });
      sessionStorage.setItem(sessionId, "done");
      responseButtons.style.display="none";
      createSessionBtn.style.display="block";
    };



  
    let noClickCount = 0;
    let buttonHeight = 48; // Starting height in pixels
    let buttonWidth = 80;
    let fontSize = 20; // Starting font size in pixels
    const imagePaths = [
      "./images/image1.gif",
      "./images/image2.gif",
      "./images/image3.gif",
      "./images/image4.gif",
      "./images/image5.gif",
      "./images/image6.gif",
      "./images/image7.gif"
    ];


  
    noButton.addEventListener('click', function() {
      if (noClickCount < 5) {
        noClickCount++;
        imageDisplay.src = imagePaths[noClickCount];
        buttonHeight += 35; // Increase height by 5px on each click
        buttonWidth += 35;
        fontSize += 25; // Increase font size by 1px on each click
        yesButton.style.height = `${buttonHeight}px`; // Update button height
        yesButton.style.width = `${buttonWidth}px`;
        yesButton.style.fontSize = `${fontSize}px`; // Update font size
        if (noClickCount < 6) {
          noButton.textContent = ["No", "Are you sure?", "Pookie please", "Don't do this to me :(", "You're breaking my heart", "I'm gonna cry..."][noClickCount];
        }
        }else{
            saveResponse("No");
            valentineQuestion.textContent = "Ooooh Misery !!!😭"
        }
    });
  
    yesButton.addEventListener('click', () => {
      imageDisplay.src = './images/image7.gif'; // Change to image7.gif
      valentineQuestion.textContent = "Yayyy!! 💞"; // Change the question text
      responseButtons.style.display = 'none'; // Hide both buttons
      confetti(); // Trigger confetti animation
      saveResponse("Yes");
      document.getElementById("sessionInfo").textContent = `Happy Valentine ${username} & ${senderUsername} !!!❤️`
    });
  });
