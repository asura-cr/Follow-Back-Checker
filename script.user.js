// ==UserScript==
// @name         Insta ig
// @version      1
// @description  Check who you are following but isnt following back
// @author       asura-cr
// @match        https://www.instagram.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none   
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

    const following = await fetchList('following');
    console.log('Total following: ',following.length)

    const followers = await fetchList('followers');
    console.log('Total Followers: ',followers.length)

    const followerIds= new Set(followers.map((u) => u.pk));
    const notFollowingBack= following.filter((u) => !followerIds.has(u.pk));

    console.log("Not Following Back: ", notFollowingBack.length)
    console.log(notFollowingBack.map((u) => u.username))



})(

);
