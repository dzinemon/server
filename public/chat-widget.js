;(function () {
  const styleTag = `
        <style>
            #chat-frame-widget {
              transition: all 500ms ease-in-out;
              transform: translate(3%,3%) skewY(-3deg) scale(0.5) rotate(6deg);
              opacity: 0;
              transform-origin: right bottom;
            }

            #btn-close-chat {
                position: fixed;
                top: 8px;
                right: 8px;
                display: block;
                z-index: 999999999 !important;
                border-radius: 9999px;
                color: #4791ce;
                cursor: pointer;
                border: 2px solid #4791ce;
                align-items: center;
                justify-content: center;
                padding: 0.1rem;
            }

            #chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: grid;
                z-index: 999999999 !important;
            }
            #chat-messages {
                height: auto;
                padding: 10px;
                overflow-y: auto;
            }
            #btn-trigger-chat {
                box-sizing: border-box;
                margin-left: auto;
                margin-top: auto;
                display: inline-flex;
                height: 3rem;
                width: 3rem;
                align-items: center;
                justify-content: center;
                border-radius: 9999px;
                color: white;
                cursor: pointer;
                background-color: #4791ce;
                border-style: none;
            }
            .h-7 {
                height: 1.75rem;
            }
            .w-7 {
                width: 1.75rem;
            }
            .rounded-lg {
                border-radius: 0.5rem;
            }
            .shadow-xl {
                --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
                --tw-ring-shadow: 0 0 #0000;
                --tw-shadow-colored: 0 0 #0000;
                --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
                    0 8px 10px -6px rgb(0 0 0 / 0.1);
                --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color),
                    0 8px 10px -6px var(--tw-shadow-color);
                box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
                    var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
            }
            .ring-1 {
                --tw-ring-color: rgb(17 24 39 / 0.05);
                --tw-ring-shadow: 0 0 #0000;
                --tw-ring-offset-color: #fff;
                --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
                    var(--tw-ring-offset-width) var(--tw-ring-offset-color);
                --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
                    calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
                box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
                    var(--tw-shadow, 0 0 #0000);
            }
        </style>
    `

  const components = {
    icon_close: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7"><line x1="18" x2="6" y1="6" y2="18"></line><line x1="6" x2="18" y1="6" y2="18"></line></svg>`,
    icon_message: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>`,
  }

  const ifraneInnerHTMLClose = `<iframe id="chat-frame-widget" 
    src="https://kruze-ai-agent.vercel.app/widget" 
    data-script-src="/widget" 
    class="shadow-xl ring-1 rounded-lg" 
    style="display: none; 
    border: none; 
    position: fixed;
    inset: 8px 8px 8px 8px;
    height: calc(100% - 8px);
    width: -moz-available; 
    height: -webkit-fill-available;
    width: -webkit-fill-available; 
    color-scheme: none; 
    margin: 0px; max-height: 100vh; max-width: 100vw; 
    visibility: visible; z-index: 999999999 !important;"></iframe>
    <button style="display: none !important" id="btn-trigger-chat" class="shadow-xl ring-1">${components.icon_message}</button>
    <button id="btn-close-chat" style="display:none" class="">${components.icon_close}</button>`

  const ifraneInnerHTMLToggle = `<iframe id="chat-frame-widget" 
    data-script-src="https://kruze-ai-agent.vercel.app/widget" 
    src="/widget" 
    class="shadow-xl ring-1 rounded-lg" 
    style="display: none; 
    border: none; 
    position: fixed;
    inset: 15px 15px 75px 15px;
    height: -webkit-fill-available;
    width: -webkit-fill-available; 
    color-scheme: none; 
    margin: 0px; max-height: 100vh; max-width: 100vw; 
    visibility: visible; z-index: 999999999 !important;"></iframe>
    <button id="btn-trigger-chat" class="shadow-xl ring-1">${components.icon_message}</button>`

  function intChatInterface(chatKey) {
    const chatWidget = document.createElement('div')
    chatWidget.id = 'chat-widget'
    chatWidget.innerHTML = ifraneInnerHTMLClose

    document.head.insertAdjacentHTML('beforeend', styleTag)
    document.body.appendChild(chatWidget)

    const btn = document.getElementById('btn-trigger-chat')
    const btn_section = document.getElementById('btn-trigger-chat-section')
    const btn_close_chat = document.getElementById('btn-close-chat')
    const frameWidget = document.getElementById('chat-frame-widget')

    const buttonsByClass = document.getElementsByClassName('btn-trigger-chat')
    // add event listener to each button if they exist and check if they have data-question  attribute, and add onclick envent to set session storage item with the value of the data-question attribute

    if (buttonsByClass.length > 0) {
      for (let i = 0; i < buttonsByClass.length; i++) {
        const btn = buttonsByClass[i]
        if (btn.getAttribute('data-question')) {
          btn.addEventListener('click', () => {
            sessionStorage.setItem(
              'question',
              btn.getAttribute('data-question')
            )
            // open chat widget
            openWidget()
          })
        }
      }
    }

    btn_close_chat.addEventListener('click', () => {
      closeWidget()
    })

    function openWidget() {
      btn.innerHTML = components.icon_close
      document.body.style.overflowY = 'hidden'

      frameWidget.style.display = 'block'
      setTimeout(() => {
        frameWidget.style.transform =
          'translate(0%,0%) skewY(0deg) scale(1) rotate(0deg)'
        frameWidget.style.opacity = '1'
        btn_close_chat.style.display = 'block'
      }, 100)
    }

    function closeWidget() {
      btn.innerHTML = components.icon_message
      document.body.style.overflowY = 'auto'

      frameWidget.style.transform =
        'translate(3%,3%) skewY(-3deg) scale(0.5) rotate(6deg)'
      frameWidget.style.opacity = '0'
      setTimeout(() => {
        frameWidget.style.display = 'none'
        btn_close_chat.style.display = 'none'
      }, 300)
    }

    btn_section.addEventListener('click', () => {
      if (btn.innerHTML === components.icon_message) {
        openWidget()
      } else {
        closeWidget()
      }
    })

    btn.addEventListener('click', () => {
      if (btn.innerHTML === components.icon_message) {
        openWidget()
      } else {
        closeWidget()
      }
    })
  }

  window.ChatWidget = {
    init: intChatInterface,
  }
})()
