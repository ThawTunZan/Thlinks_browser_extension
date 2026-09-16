const backendURL = "https://thlinks-backend.onrender.com";
const currentUserId = "6a9ebc3c-d2bd-4179-8927-ff174ec4a272";

let urlList = [];

document.addEventListener("DOMContentLoaded", () => {
    const sendMessageId = document.getElementById("sendmessageid");
    const submitButton = document.getElementById("submit-button");
    const inputText = document.getElementById("input-text");
    const urlListElement = document.getElementById("url-list");

    function renderUrlList() {
        if (!urlListElement) {
            return;
        }

        urlListElement.innerHTML = "";

        urlList.forEach((item) => {
            const listItem = document.createElement("li");
            listItem.style.display = "flex";
            listItem.style.alignItems = "center";
            listItem.style.gap = "12px";
            listItem.style.marginBottom = "8px";

            const urlLink = document.createElement("a");
            urlLink.href = item.url;
            urlLink.textContent = item.url;
            urlLink.target = "_blank";
            urlLink.rel = "noreferrer";

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", async () => {
                await deleteUrl(currentUserId, item.id);
                await loadUrls(currentUserId);
            });

            listItem.appendChild(urlLink);
            listItem.appendChild(deleteButton);
            urlListElement.appendChild(listItem);
        });
    }

    if (sendMessageId) {
        sendMessageId.onclick = function () {
            chrome.tabs.query(
                { active: true, currentWindow: true },
                function (tabs) {
                    chrome.tabs.sendMessage(
                        tabs[0].id,
                        {
                            url: chrome.runtime.getURL("images/stars.jpeg"),
                            imageDivId: crypto.randomUUID(),
                            tabId: tabs[0].id,
                        },
                        function () {
                            window.close();
                        },
                    );
                },
            );
        };
    }

    if (submitButton) {
        submitButton.onclick = async function () {
            const inputValue = inputText ? inputText.value.trim() : "";

            if (!inputValue) {
                return;
            }

            if (urlList.some((item) => item.url === inputValue)) {
                alert("This URL has already been submitted.");
                return;
            }

            await addUrl(currentUserId, inputValue);
            if (inputText) {
                inputText.value = "";
            }
            await loadUrls(currentUserId);
        };
    }

    async function loadUrls(userId) {
        const response = await fetch(
            `${backendURL}/urls?user_id=${encodeURIComponent(userId)}`,
        );

        if (!response.ok) {
            throw new Error(`Failed to load URLs: ${response.status}`);
        }

        const data = await response.json();
        urlList = Array.isArray(data) ? data : [];
        renderUrlList();
    }

    async function addUrl(userId, url) {
        const response = await fetch(`${backendURL}/add-url`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: userId,
                url: url,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to add URL: ${response.status}`);
        }

        return response.json();
    }

    async function deleteUrl(userId, urlId) {
        const response = await fetch(`${backendURL}/delete-url`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: userId,
                url_id: urlId,
            }),
        });

        if (!response.ok) {
            throw new Error(`Failed to delete URL: ${response.status}`);
        }

        return response.json();
    }

    loadUrls(currentUserId).catch((error) => {
        console.error(error);
    });
});
