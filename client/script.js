// import bot from './assets/bot.svg'
// import user from './assets/user.svg'

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container')

let loadInterval;

function messageLoader(el) {
  el.textContent = ''

  loadInterval = setInterval(() => {
    el.textContent += '.';
    if (el.textContent === '....')  el.textContent = ''
  }, 300)
}

function typeText(el, text) {
let idx = 0;

// takes in res from chatGPT
//returns one char every 20ms to enhance engagement feeling for user
let interval = setInterval(() => {
 if(idx < text.length) {
  el.innerHTML += text.charAt(idx);
  idx++
 }
//  once there isn't anymore chars in text param
//clear interval
 if (idx > text.length) clearInterval(interval)

}, 10)
}

// returns unique id using built in JS methods
function generateUniqueId() {
  const timeStamp = Date.now();
  const randomNum = Math.random(); 
  const hexString = randomNum.toString(16);

  return `id-${timeStamp}-${hexString}`

}

function chatStripe(isAI, val, id){
  return (
    `
    <div class="wrapper ${isAI && 'ai'}">
      <div class="chat">
        <div class="profile"> 
          <img 
          src="${isAI ? './assets/bot.svg' : './assets/user.svg'}"
          alt="${isAI ? 'bot' : 'user'}"
          />
       
    </div>
    <div class="message" id=${id}> ${val}</div>
    </div>
    </div>
    `
  )
}

const handleSubmit = async(e) => {
  e.preventDefault(); 

  const data = new FormData(form); 
// user chatStripe
  chatContainer.innerHTML += chatStripe(false, data.get('prompt'));

  form.reset(); 
  console.log(data.get('prompt'))
// bot chatStripe
  const id = generateUniqueId(); 
  chatContainer.innerHTML += chatStripe(true, "", id);

  // centers on current message
  chatContainer.scrollTop = chatContainer.scrollHeight;

const messageDiv = document.getElementById(id)
messageLoader(messageDiv)

const response = await fetch('http://localhost:5000/', {
  method: "POST", 
  headers: {
   'Content-type': 'application/json'
  }, 
  body: JSON.stringify({
    prompt: data.get('prompt')
  })
})
// clear interval and message div
clearInterval(loadInterval);
messageDiv.innerHTML = '';
if(response.ok) {
  const data = await response.json();
  const parsed = data.bot.trim();
  // const parsed = data.bot;

  typeText(messageDiv, parsed);
} else {
  const err = await response.text();
  messageDiv.innerHTML = 'something went wrong'

  console.log(err.message, err);

}
  }

  form.addEventListener('submit', handleSubmit)
  
  // submit if enter is pressed
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  })