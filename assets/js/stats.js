API_URL = `https://api.lanyard.rest/v1`;
USERID = `847574029770817598`;
document.addEventListener(`contextmenu`, (e) => e.preventDefault());

window.onscroll = function () {
    window.scrollTo(0,0);
}
function ctrlShiftKey(e, keyCode) {
    return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
}
document.onkeydown = (e) => {
  // Disable F12, Ctrl + Shift + I, Ctrl + Shift + J, Ctrl + U
  if (
    event.keyCode === 123 ||
    ctrlShiftKey(e, `I`) ||
    ctrlShiftKey(e, `J`) ||
    ctrlShiftKey(e, `C`) ||
    (e.ctrlKey && e.keyCode === `U`.charCodeAt(0))
  )
    return false;
};
async function fetchResponse(userId) {
    try {
        const url = await fetch(`${API_URL}/users/${userId}`);
        const response = await url.json();
        return response;
    } catch (error) {
        console.error(error);
    }
}

async function setAvatar(response, card) {
    var avatarId = response.data.discord_user.avatar;
    var fullUrl = `https://cdn.discordapp.com/avatars/${USERID}/${avatarId}`;
    if (!response.data.discord_user.avatar) fullUrl = "https://cdn.discordapp.com/embed/avatars/1.png"
    document.getElementsByClassName(`${card}-pfp1`)[0].src = fullUrl
    var link = document.querySelector("link[rel~='icon']");
    if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
    }
    link.href = fullUrl
    document.getElementById("meta-image").content = fullUrl
}
function returnColor(status) {
    switch (status) {
        case `online`: return `#3ba45d`;
        case `dnd`: return  `#ed4245`;
        case `idle`: return  `#faa81a`;
        case `offline`: return  `#747e8c`;
    }
}
async function setAvatarFrame(response, card) {
    var color = returnColor(response.data.discord_status)
    let presence = response.data.activities.find(r=> r.type === 1)
    if (presence) {
        if (presence.url.includes("twitch.tv")) color = `#301934`
    }
    document.getElementsByClassName(`card-pfp1`)[0].style = `border: 4px solid ${color}`
    //document.getElementById(`bannerCard`).style = `border: 4px solid ${color}`
    //document.getElementsByClassName(`wrapper`)[0].style = `background: radial-gradient(ellipse at top, ${color}  0%, #2C3037 90%);`
}
async function setUsername(response) {
    var user = response.data.discord_user.username;
    var display = response.data.discord_user.display_name;
    var discriminator = "#" + response.data.discord_user.discriminator;
    var fullName =`${user}${discriminator}`
    if (response.data.discord_user.discriminator === "0") fullName = user
    document.getElementById(`username`).innerHTML = `"${display}"`;
    document.getElementsByClassName(`display-name`)[0].innerHTML = `@${fullName}`;
     document.getElementById(`connection-username`).content = fullName;
    // document.getElementById(`connection-username`).title = fullName;
    document.title = `@${display}`
}


async function setSpotify(response) {
    if (!response.data.listening_to_spotify) {
        document.getElementsByClassName(`spotifyData`)[0].style.display = `none`
        document.getElementsByClassName(`spotify-username`)[0].innerHTML = "There is no spotify at the moment."
        document.getElementsByClassName(`spotify-pfp`)[0].src = "assets/logo/spotify.jpg"
        document.getElementsByClassName(`spotify-outerbar`)[0].style.display = `none`
        document.getElementById(`spotify-innerbar`).style = `color: transparent;`
        document.getElementsByClassName(`spotify-outerbar`)[0].style.display = `none`
        document.getElementById(`spotify-time-start`).style.display = `none`
        document.getElementById(`spotify-time-end`).style.display = `none`
    } else {
        document.getElementsByClassName(`spotifyData`)[0].style.display = `block`
        document.getElementsByClassName(`spotify-pfp`)[0].src = response.data.spotify.album_art_url;
        document.getElementsByClassName(`spotify-username`)[0].innerHTML = "Listening to Spotify"
        document.getElementsByClassName(`spotify-status2`)[0].innerHTML = `"${response.data.spotify.song}"`
        document.getElementsByClassName(`spotify-status`)[0].innerHTML = response.data.spotify.artist
        document.getElementById(`spotify-innerbar`).style = `color: black;`
        document.getElementsByClassName(`spotify-outerbar`)[0].style.display = `block`
        document.getElementById(`spotify-time-start`).style.display = `block`
        document.getElementById(`spotify-time-end`).style.display = `block`
        setSpotifyBar(response);
    }
}
function setCss(card, rpc) {
    document.getElementsByClassName(`${card}-pfp`)[0].style.display = `block`
    document.getElementsByClassName(`${card}-username`)[0].innerHTML = `Playing ${rpc.name}`
    if (rpc.details) document.getElementsByClassName(`${card}-status`)[0].innerHTML = rpc.details 
    else document.getElementsByClassName(`${card}-status`)[0].innerHTML = "" 
    if(rpc.state) document.getElementsByClassName(`${card}-status2`)[0].innerHTML = rpc.state 
    else document.getElementsByClassName(`${card}-status2`)[0].innerHTML = ""
    if (rpc.name === "VALORANT") {
        document.getElementsByClassName(`${card}-pfp`)[0].src = "assets/media/VALORANT.png"
        document.getElementsByClassName(`${card}-status`)[0].innerHTML = ""
    }
    else if (rpc.name === "MovieBoxPro") document.getElementsByClassName(`${card}-pfp`)[0].src = "assets/media/movieboxpro.png"
    
    else if (rpc.assets) {
        if (rpc.assets.small_image && !rpc.assets.large_image) {
            document.getElementsByClassName(`${card}-pfp`)[0].src = `https://cdn.discordapp.com/app-assets/` + rpc.application_id + `/` + rpc.assets.small_image + `.png`
        } else if (rpc.assets && rpc.assets.large_image.includes("mp:external")) document.getElementsByClassName(`${card}-pfp`)[0].src = "https://" + rpc.assets.large_image.split("https/")[1]            
        else document.getElementsByClassName(`${card}-pfp`)[0].src = `https://cdn.discordapp.com/app-assets/` + rpc.application_id + `/` + rpc.assets.large_image + `.png`
    } else document.getElementsByClassName(`${card}-pfp`)[0].style.display = `none`

    if (rpc.timestamps) setTimeBar(rpc, card)
}
async function setPresence(response) {
    var count = 1
    response.data.activities.forEach(rpc => {
        if (rpc.name === "Spotify") return
        var existingDiv = document.querySelector(`.presenceData${count}`);
        if (!existingDiv) {
            // Create new div if it doesn't exist
            var newDiv = document.createElement("div");
            newDiv.className = `presenceData${count}`;
            newDiv.innerHTML = `
                <br>
                <div id="card${count}-user-profile" style="color: #fff;" class="user-profile">
                    <div class="Profile-pic">
                        <img class="card${count}-pfp" src="assets/loader.gif" id="activityCard">
                    </div>
                    <div class="user-info">
                        <div class="card${count}-username" style="margin-left: 0px;" id="username">There is no status.</div>
                        <div class="card${count}-status" style="margin-left: 0px;" id="status"></div>
                        <div class="card${count}-status2" style="margin-left: 0px;" id="status2"></div>
                        <div class="card${count}-status3" style="margin-left: 0px;" id="status3"></div>
                    </div>
                </div>
            `;
            newDiv.style.display = "block";
            var cardDivs = document.querySelectorAll('.card');
            cardDivs[1].appendChild(newDiv);
            setCss(`card${count}`, rpc);
        } else {
            // Update existing div if it exists
            existingDiv.style.display = "block";
        }
        setCss(`card${count}`, rpc)
        document.getElementsByClassName(`presenceData${count}`)[0].style.display = `block`
        count++
    })
    var existingDivs = document.querySelectorAll('[class^="presenceData"]');
    existingDivs.forEach((div, index) => {
        var count = index + 1; // Count starts from 1
        if (count > response.data.activities.length) {
            console.log(div)
            div.parentNode.removeChild(div);
        }
    });
    
}

async function setStatus(response, card) {
    if (response.data.discord_status == `offline`) {
        return;
    }
    let customstat =response.data.activities.find(r => r.type === 4)
    if (!customstat) return document.getElementsByClassName(`${card}-status`)[0].innerHTML = ``
    let emoji = ""
    if (customstat.emoji) {
        if (customstat.emoji.name && !customstat.emoji.id) emoji = customstat.emoji.name
        else {
            let link = "https://cdn.discordapp.com/emojis/"
            if (customstat.emoji.animated) {
                link = link + customstat.emoji.id + ".gif"
            } else link = link + customstat.emoji.id + ".png"
            emoji = `<img class="${card}-emoji" id="emojistat" src="${link}">`
        }
    }
    document.getElementsByClassName(`${card}-status`)[0].innerHTML = `${emoji}  ${customstat.state || ""}`
}
setTimeBar = (rpc, card) => {
    var text = document.getElementsByClassName(`${card}-status3`)[0]
    if (rpc.timestamps.end) {
        text.style.display = "block"
        var currentTimestamp = new Date().getTime();
        var endTimestamp = rpc.timestamps.end; // This should be replaced with the actual end timestamp from your data
        var timeDifference = endTimestamp - currentTimestamp;
        var minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
        let hours = 0;
        if (minutes >= 60) {
            hours = Math.floor(minutes / 60);
        }
        var seconds = Math.floor((timeDifference / 1000) % 60);
        if (seconds < 10) seconds = `0${seconds}`
        if (minutes < 10) minutes = `0${minutes}`
        if (hours > 0) {
            var remainingMinutes = minutes % 60;
            if (remainingMinutes < 10) remainingMinutes = `0${remainingMinutes}`
            text.innerHTML = `${hours}:${remainingMinutes}:${seconds} left`
        } else text.innerHTML = `${minutes}:${seconds} left`
    } else if (rpc.timestamps.start) {
        text.style.display = "block"
        var currentTimestamp = Date.now();
        var timeDifference = currentTimestamp - rpc.timestamps.start;
        var seconds = Math.floor(timeDifference / 1000);
        var minutes = Math.floor(seconds / 60);
        var remainingSeconds = seconds % 60;
        if (remainingSeconds < 10) remainingSeconds = `0${remainingSeconds}`
        if (minutes < 10) minutes = `0${minutes}`
        let hours = 0;
        if (minutes >= 60) {
            console.log()
            hours = Math.floor(minutes / 60);
        }
        if (hours > 0) {
            var remainingMinutes = minutes % 60;
            if (remainingMinutes < 10) remainingMinutes = `0${remainingMinutes}`
            text.innerHTML = `${hours}:${remainingMinutes}:${remainingSeconds} elapsed`
        } else text.innerHTML = `${minutes}:${remainingSeconds} elapsed`
    
    }
}
async function setSpotifyBar(response) {
    var bar = document.getElementById(`spotify-innerbar`);
    var bar2 = document.getElementById(`spotify-time-end`);
    var bar3 = document.getElementById(`spotify-time-start`);
    if (response.data.listening_to_spotify == false) {
        bar.style.display = `none`;
        bar2.innerHTML = ``;
        bar3.innerHTML = ``;
        return;
    }
    const date = new Date().getTime();
    const v1 = response.data.spotify.timestamps.end -
        response.data.spotify.timestamps.start;
    const v2 = date - response.data.spotify.timestamps.start;

    function spotifyTimeSet(date, element) {
        const x = document.getElementById(element);
        const y = new Date(date);
        const minutes = y.getMinutes();
        const seconds = y.getSeconds();
        const formmatedseconds = seconds < 10 ? `0${seconds}` : seconds;
        x.innerHTML = `${minutes}:${formmatedseconds}`;
    }
    spotifyTimeSet(v1, `spotify-time-end`);
    spotifyTimeSet(v2, `spotify-time-start`);
    prcnt = (v2 / v1) * 100;
    precentage = Math.trunc(prcnt);
    prccc = Math.round((prcnt + Number.EPSILON) * 100) / 100;
    i = 1;
    bar.style.display = `block`;
    bar.style.width = prccc + `%`;
}
async function setSocialBanner(res, status) {
    if (!res.user.banner) return document.getElementById(`bannerCard`).style = `
    display: none;
    border: 0; `
    //document.getElementById(`bannerCard`).style = `background-color: #${res.user_profile.theme_colors[1].toString(16)};border: 4px solid ${returnColor(status)}`
    document.getElementById("bannerCard").style.display = "block"
    if (res.user.banner.startsWith("a_")) var link = `https://cdn.discordapp.com/banners/${res.user.id}/${res.user.banner}.gif?size=4096`
    else var link = `https://cdn.discordapp.com/banners/${res.user.id}/${res.user.banner}.png?size=4096`
    document.getElementById(`bannerCard`).src = link
}

async function setActiveOnWhere(response) {
    response = response.data
    if (response.active_on_discord_web) document.getElementById("web").src = "assets/media/active/greenweb.png"
    else document.getElementById("web").src = "assets/media/active/redweb.png"
    if (response.active_on_discord_mobile) document.getElementById("mobile").src = "assets/media/active/greenphone.png"
    else document.getElementById("mobile").src = "assets/media/active/redphone.png"
    if (response.active_on_discord_desktop) document.getElementById("desktop").src = "assets/media/active/greendesktop.png"
    else document.getElementById("desktop").src = "assets/media/active/reddesktop.png"
}

async function setAboutMe(res) {
    document.getElementById("aboutMe").innerHTML = res.user.bio.replaceAll("\n", "").replaceAll("**", "<b>").replaceAll("|", "")
}
async function invoke(USERID, card) {
    start(USERID, card)
    var response, res;
    setInterval(async function() {
        response = await fetchResponse(USERID);
        setSpotify(response)
        setActiveOnWhere(response)
        setStatus(response, card);
        setPresence(response);
        setAvatarFrame(response, card);
        setUsername(response);
    }, 1000)

    setInterval(async function() {
        res = await fetch(`https://dcdn.dstn.to/profile/${USERID}`)
        res = await res.json()
        setSocialBanner(res, response.data.discord_status)
        setAboutMe(res)
        setBackground(res)
    }, 10000)

    // setInterval(richpresenceInvoke(), 1000);
}
function integerToHexColor(integerColor) {
    // Extract red, green, and blue components
    const red = (integerColor >> 16) & 255;
    const green = (integerColor >> 8) & 255;
    const blue = integerColor & 255;

    // Convert each component to hexadecimal and pad with zeros if needed
    const redHex = red.toString(16).padStart(2, '0');
    const greenHex = green.toString(16).padStart(2, '0');
    const blueHex = blue.toString(16).padStart(2, '0');

    // Concatenate the hexadecimal values
    const hexColor = `#${redHex}${greenHex}${blueHex}`;

    return hexColor;
}
async function setBackground(res) {
    theme_colors = res.user_profile.theme_colors
    // document.body.style.background = `radial-gradient(ellipse at center, ${integerToHexColor(theme_colors[0])} 30%, ${integerToHexColor(theme_colors[1])} 95%);`
    document.body.style.setProperty('background', `radial-gradient(ellipse at center, ${integerToHexColor(theme_colors[0])} 30%, ${integerToHexColor(theme_colors[1])} 80%)`, 'important');
}
async function start(USERID, card) {
    var response = await fetchResponse(USERID);
    setSpotify(response)
    setStatus(response, card);
    setPresence(response);
    setAvatar(response, card);
    setUsername(response, card);
    setAvatarFrame(response, card);
    var res = await fetch(`https://dcdn.dstn.to/profile/${USERID}`)
    res = await res.json()
    setSocialBanner(res, response.data.discord_status)
    setAboutMe(res)
    setBackground(res)
}
