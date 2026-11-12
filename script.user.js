// ==UserScript==
// @name         Insta ig
// @version      1
// @description  Check who you are following but isnt following back
// @author       asura-cr
// @match        https://www.instagram.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_xmlhttpRequest
// @connect      fbcdn.net
// @connect      cdninstagram.com
// ==/UserScript==

(async () => {
    const userId = document.cookie.match(/ds_user_id=(\d+)/)[1];
    console.log("Your id is " + userId);
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));


    async function fetchList(type) {
        const um = [];
        let maxId = '';

        while (true) {
            const url = `/api/v1/friendships/${userId}/${type}/?count=50` + (maxId ? `&max_id=${maxId}` : '');
            const res = await fetch(url, {
                credentials: 'include',
                headers: { 'x-ig-app-id': '936619743392459' }
            });

            const data = await res.json();
            um.push(...data.users);
            console.log(`got ${type} so far:`, um.length);

            if (!data.next_max_id) break;
            maxId = data.next_max_id;
            await sleep(1500);
        }
        return um;
    }

    function loadPic(img,url) {
        GM_xmlhttpRequest({
            method: 'GET',
            url:url,
            responseType: 'blob',
            onload: (res) => {
                img.src=URL.createObjectURL(res.response);
            }
        });
    }

    const panel = document.createElement('div');
    panel.style.cssText = `
    position:fixed; 
    right: 16px;
    bottom: 16px;
    z-index: 99999999999999999999999999999999999999999999999999999999999999999;
    width: 320px;
    max-height: 60vh;
    overflow: auto;
    background: black;
    color: white;
    padding: 12px;
    border-radius: 10px;
    `;

    const scanBtn = document.createElement('button');
    scanBtn.textContent= 'Scan';
    scanBtn.style.cssText = 'background:#0095f6; color:white; border:0; border-radius:6px; padding:6px 12px; cursor:pointer;'

    const status = document.createElement('div');
    status.textContent='Press Scan to start';
    status.style.cssText = 'color:#aaa; margin:8px 0;';

    const results = document.createElement('div');

    panel.append(scanBtn,status,results);
    document.body.appendChild(panel);


    function addSection(heading, users) {
        const h = document.createElement('div');
        h.textContent = heading + ' (' + users.length + ')';
        h.style.cssText = 'font-weight: bold; margin:12px 0px 4px; color: #aaa';
        results.appendChild(h);

        for (const user of users) {
            const row = document.createElement('a');
            row.href = `https://www.instagram.com/${user.username}/`
            row.target= '_blank'
            row.style.cssText = 'display:flex; align-items:center; gap:10px; padding: 6px 4px; border-radius:8px; color:white; text-decoration:none;';

            const pic = document.createElement('img');
            loadPic(pic,user.profile_pic_url);
            pic.style.cssText='width:32px; height:32px; border-radius:50%; object-fit:cover;';

            const name = document.createElement('span');
            name.textContent= user.username + (user.is_verified ? ' ✓' : '')

            row.onmouseenter= () => (row.style.background='#222');
            row.onmouseleave = () => (row.style.background = 'transparent')

            row.append(pic,name);
            results.appendChild(row);
        }

    };
    
    async function scan() {
        scanBtn.disabled = true;
        results.innerHTML = '';

        status.textContent='Fetching following...';
        const following = await fetchList('following');
        console.log('Total following: ', following.length)

        status.textContent='Fetching followers...'
        const followers = await fetchList('followers');
        console.log('Total Followers: ', followers.length)

        const followerIds = new Set(followers.map((u) => u.pk));
        const notFollowingBack = following.filter((u) => !followerIds.has(u.pk));
        const verified = notFollowingBack.filter((u) => u.is_verified);
        const normal = notFollowingBack.filter((u) => !u.is_verified);

        console.log("Not Following Back: ", notFollowingBack.length)
        console.log(notFollowingBack.map((u) => u.username))

        addSection('Verified / celebs', verified);
        addSection('Regular accounts',normal);

        status.textContent = 'Traitors (Not following back): ' + notFollowingBack.length
        scanBtn.disabled=false;
        }

    scanBtn.onclick=scan;



})();
