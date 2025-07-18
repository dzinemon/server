;(function () {
  const styleTag = `
        <style>
            #threaded-chat-frame-widget {
              transition: all 500ms ease-in-out;
              transform: translate(3%,3%) skewY(-3deg) scale(0.5) rotate(6deg);
              opacity: 0;
              transform-origin: right bottom;
            }

            #btn-close-threaded-chat {
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
                background: white;
            }

            #threaded-chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                display: grid;
                z-index: 999999999 !important;
            }

            #btn-trigger-threaded-chat {
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
                position: relative;
            }

            .threaded-chat-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background-color: #ef4444;
                color: white;
                border-radius: 50%;
                width: 18px;
                height: 18px;
                font-size: 10px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
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
    icon_threads: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7"><path d="M3 12h18m-9-9v18"></path><circle cx="12" cy="12" r="3"></circle></svg>`,
  }

  const iframeInnerHTMLClose = `<iframe id="threaded-chat-frame-widget" 
    src="/threaded-widget" 
    data-script-src="/threaded-widget" 
    class="shadow-xl ring-1 rounded-lg" 
    style="display: none; 
    border: none; 
    position: fixed;
    inset: 8px 8px 8px 8px;
    height: calc(100% - 16px);
    width: calc(100% - 16px);
    color-scheme: none; 
    margin: 0px; max-height: 100vh; max-width: 100vw; 
    visibility: visible; z-index: 999999999 !important;"></iframe>
    <button id="btn-trigger-threaded-chat" class="shadow-xl ring-1">
      ${components.icon_message}
      <span class="threaded-chat-badge" id="thread-count-badge" style="display: none;">0</span>
    </button>
    <button id="btn-close-threaded-chat" style="display:none" class="">${components.icon_close}</button>`

  function initThreadedChatInterface() {
    const chatWidget = document.createElement('div')
    chatWidget.id = 'threaded-chat-widget'
    chatWidget.innerHTML = iframeInnerHTMLClose

    document.head.insertAdjacentHTML('beforeend', styleTag)
    document.body.appendChild(chatWidget)

    const btn = document.getElementById('btn-trigger-threaded-chat')
    const btn_section = document.getElementById(
      'btn-trigger-threaded-chat-section'
    )
    const btn_close_chat = document.getElementById('btn-close-threaded-chat')
    const frameWidget = document.getElementById('threaded-chat-frame-widget')
    const threadCountBadge = document.getElementById('thread-count-badge')

    // Listen for messages from the iframe to update thread count
    window.addEventListener('message', function (event) {
      if (event.data.type === 'THREAD_COUNT_UPDATE') {
        const count = event.data.count
        if (count > 0) {
          threadCountBadge.textContent = count
          threadCountBadge.style.display = 'flex'
        } else {
          threadCountBadge.style.display = 'none'
        }
      }
    })

    // Check for buttons with class 'btn-trigger-threaded-chat' and add event listeners
    const buttonsByClass = document.getElementsByClassName(
      'btn-trigger-threaded-chat'
    )
    if (buttonsByClass.length > 0) {
      for (let i = 0; i < buttonsByClass.length; i++) {
        const btn = buttonsByClass[i]
        if (btn.getAttribute('data-question')) {
          btn.addEventListener('click', () => {
            sessionStorage.setItem(
              'threadedChatQuestion',
              btn.getAttribute('data-question')
            )
            openWidget()
          })
        } else {
          btn.addEventListener('click', () => {
            openWidget()
          })
        }
      }
    }

    btn_close_chat.addEventListener('click', () => {
      closeWidget()
    })

    function openWidget() {
      btn.innerHTML =
        components.icon_close +
        '<span class="threaded-chat-badge" id="thread-count-badge" style="display: none;">0</span>'
      document.body.style.overflowY = 'hidden'
      btn_close_chat.style.display = 'block'

      frameWidget.style.display = 'block'
      setTimeout(() => {
        frameWidget.style.transform =
          'translate(0%, 0%) skewY(0deg) scale(1) rotate(0deg)'
        frameWidget.style.opacity = '1'
      }, 100)
    }

    function closeWidget() {
      const currentBadgeText = threadCountBadge.textContent
      const badgeHtml =
        threadCountBadge.style.display !== 'none'
          ? `<span class="threaded-chat-badge" id="thread-count-badge" style="display: flex;">${currentBadgeText}</span>`
          : '<span class="threaded-chat-badge" id="thread-count-badge" style="display: none;">0</span>'

      btn.innerHTML = components.icon_message + badgeHtml
      document.body.style.overflowY = 'auto'
      btn_close_chat.style.display = 'none'

      frameWidget.style.transform =
        'translate(3%,3%) skewY(-3deg) scale(0.5) rotate(6deg)'
      frameWidget.style.opacity = '0'
      setTimeout(() => {
        frameWidget.style.display = 'none'
      }, 300)
    }

    btn.addEventListener('click', () => {
      if (
        frameWidget.style.display === 'none' ||
        frameWidget.style.display === ''
      ) {
        openWidget()
      } else {
        closeWidget()
      }
    })

    // Add event listener for the section button from the main page
    if (btn_section) {
      btn_section.addEventListener('click', () => {
        if (
          frameWidget.style.display === 'none' ||
          frameWidget.style.display === ''
        ) {
          openWidget()
        } else {
          closeWidget()
        }
      })
    }

    // Initialize thread count from localStorage
    try {
      const localThreads = JSON.parse(
        localStorage.getItem('threadedChatThreads') || '[]'
      )
      if (localThreads.length > 0) {
        threadCountBadge.textContent = localThreads.length
        threadCountBadge.style.display = 'flex'
      }
    } catch (e) {
      console.log('Error reading threaded chat threads from localStorage:', e)
    }
  }

  window.ThreadedChatWidget = {
    init: initThreadedChatInterface,
  }
})()
