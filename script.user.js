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
    const userId= document.cookie.match(/ds_user_id=(\d+)/)[1];
    console.log("Your id is" + userId);

    const res = await fetch(`api/v1/friendships/18342191586/following/?count=100`, {
        credentials: 'include',
        headers: {'x-ig-app-id': '936619743392459'}
    });

    const data = await res.json();
    console.log(data);
})();
