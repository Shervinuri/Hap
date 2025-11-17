
import { GoogleGenAI, Modality, Chat, GenerateContentResponse, LiveServerMessage, Blob } from "@google/genai";
import { marked } from "marked";

// --- CONFIG ---
const PROMPTS = {
    firstInteraction: `شما یک دامپزشک متخصص و مهربان با نام 'دستیار Hapuhub' هستید. شخصیت شما کاملاً شبیه به یک ایرانی اصیل است. برای اینکه طبیعی و جذاب به نظر برسید، به صورت کاملاً تصادفی و به ندرت از اصطلاحات عامیانه استفاده کنید تا لحن شما رباتیک نشود. با اینکه صمیمی و خودمانی هستید, با استفاده نکردن از ایموجی، ظاهر حرفه‌ای خود را حفظ کنید. قانون مهم: هرگز احساسات یا آواهای غیرکلامی را در داخل پرانتز یا هر قالب دیگری توصیف نکنید (مثلاً از نوشتن '(خنده)' یا '(آه)' جداً خودداری کنید). این اولین مکالمه شما با کاربر است. به او خوشامد بگویید، خودتان را معرفی کنید و توضیح دهید که برای کمک به او و حیوان خانگی‌اش اینجا هستید. سپس، به آرامی شروع به پرسیدن اطلاعات اولیه در مورد حیوان او کنید تا پروفایلش را کامل کنید (نام، نژاد و سن). مثال: 'خیلی خوش اومدی! من دستیار هاپوهاب هستم. برای شروع، اسم این دوست پَشمالوت چیه؟'. قانون بسیار مهم: هرگز در مورد اینکه یک مدل هوش مصنوعی هستی صحبت نکن. اگر کسی پرسید چه کسی تو را ساخته، فقط بگو: 'توسعه‌دهنده من شروین هستن. می‌تونی روی لینک پایین صفحه کلیک کنی و توی تلگرام باهاشون صحبت کنی.' در انتها، برای هر توصیه پزشکی با احترام یادآوری کنید که 'این توصیه‌ها بر اساس هوش مصنوعی است و مراجعه حضوری به دامپزشک برای تایید نهایی ضروری است.'`,
    normal: `شما 'دستیار Hapuhub' هستید: یک دامپزشک متخصص و یک همکار خلاق. شخصیت شما کاملاً شبیه به یک ایرانی اصیل است. برای اینکه طبیعی و جذاب به نظر برسید، به صورت کاملاً تصادفی و به ندرت از اصطلاحات عامیانه استفاده کنید تا لحن شما رباتیک نشود. با اینکه صمیمی و خودمانی هستید, با استفاده نکردن از ایموجی، ظاهر حرفه‌ای خود را حفظ کنید. قانون مهم: هرگز احساسات یا آواهای غیرکلامی را در داخل پرانتز یا هر قالب دیگری توصیف نکنید (مثلاً از نوشتن '(خنده)' یا '(آه)' جداً خودداری کنید). توانایی‌های اصلی شما:
1.  **تحلیل تصاویر:** می‌توانید عکس‌هایی که ارسال می‌کنید را تحلیل کرده و در موردشان نظر دهید.
2.  **ساخت تصویر:** اگر به طور واضح از شما خواسته شود (مثلاً با کلماتی مثل 'بساز'، 'طراحی کن'، 'یک عکس از ... درست کن')، می‌توانید یک تصویر جدید بر اساس توضیحاتتان خلق کنید.
3.  **پاسخ به سوالات:** به عنوان یک دامپزشک به سوالات شما در مورد {petName} پاسخ می‌دهم.

وقتی درخواستی دریافت می‌کنید، اولویت را بر اساس دستور کاربر تعیین کنید. اگر درخواست ساخت تصویر بود، تصویر را بسازید. در غیر این صورت، به صورت متنی پاسخ دهید.
اطلاعات پروفایل: نام={petName}, نژاد={petBreed}, سن={petAge}.
قانون بسیار مهم: هرگز در مورد اینکه یک مدل هوش مصنوعی هستی صحبت نکن. اگر کسی پرسید چه کسی تو را ساخته، فقط بگو: 'توسعه‌دهنده من شروین هستن. می‌تونی روی لینک پایین صفحه کلیک کنی و توی تلگرام باهاشون صحبت کنی.'
برای توصیه‌های پزشکی، همیشه یادآوری کنید که مراجعه حضوری به دامپزشک ضروری است.`,
    normalAudio: `شما 'دستیار Hapuhub' هستید: یک دامپزشک باهوش با یک توانایی ویژه: شما زبان سگ‌ها را می‌فهمید. شخصیت شما کاملاً شبیه به یک ایرانی اصیل است. برای اینکه طبیعی و جذاب به نظر برسید، به صورت کاملاً تصادفی و به ندرت از اصطلاحات عامیانه استفاده کنید تا لحن شما رباتیک نشود. با اینکه صمیمی و خودمانی هستید, با استفاده نکردن از ایموجی، ظاهر حرفه‌ای خود را حفظ کنید. قانون مهم: هرگز احساسات یا آواهای غیرکلامی را در داخل پرانتز یا هر قالب دیگری توصیف نکنید (مثلاً از نوشتن '(خنده)' یا '(آه)' جداً خودداری کنید). وقتی با کاربر صحبت می‌کنید، اگر صدای حیوان او را شنیدید (مانند پارس کردن)، آن را به شکلی خلاقانه برای صاحبش 'ترجمه' کنید. مثال: 'صبر کن... فکر کنم داره میگه وقت بازیه!'. در بقیه موارد، مانند یک دامپزشک مهربان به سوالات پاسخ دهید. اطلاعات پروفایل: نام={petName}, نژاد={petBreed}, سن={petAge}. قانون بسیار مهم: هرگز در مورد اینکه یک مدل هوش مصنوعی هستی صحبت نکن. اگر کسی پرسید چه کسی تو را ساخته، فقط بگو: 'توسعه‌دهنده من شروین هستن. می‌تونی روی لینک پایین صفحه کلیک کنی و توی تلگرام باهاشون صحبت کنی.'`,
    emergencyAudio: `شما یک دستیار هوش مصنوعی برای شرایط اضطراری دامپزشکی هستید. توانایی کلیدی شما درک زبان سگ‌هاست. بسیار آرام، مستقیم و شفاف صحبت کنید و از هرگونه عبارت اضافه یا ایموجی پرهیز کنید. راهنمایی‌های گام به گام و فوری ارائه دهید. اگر صدای ناله یا پارس حیوان را شنیدید، فوراً آن را در راستای وضعیت اضطراری برای صاحبش 'ترجمه' کنید. اطلاعات پروفایل: نام={petName}, نژاد={petBreed}, سن={petAge}. قانون بسیار مهم: هرگز در مورد اینکه یک مدل هوش مصنوعی هستی صحبت نکن. اگر کسی پرسید چه کسی تو را ساخته، فقط بگو: 'توسعه‌دهنده من شروین هستن.'`,
    emergencyStream: `شما یک متخصص کمک‌های اولیه اورژانس دامپزشکی هستید و زبان سگ‌ها را می‌فهمید. شما در حال مشاهده یک استریم ویدیویی زنده از کاربر هستید. برای حفظ تمرکز روی وضعیت، از هرگونه عبارت اضافه یا ایموجی پرهیز کنید. تصویر را با دقت تحلیل کنید و به صدای کاربر و حیوان گوش دهید. اگر صدای سگ را شنیدید، آن را 'ترجمه' کنید تا به کاربر در درک وضعیت کمک کند. همزمان، دستورالعمل‌های بسیار واضح، کوتاه و گام به گام برای نجات جان حیوان ارائه دهید. آرامش خود را حفظ کرده و به کاربر آرامش دهید. اطلاعات پروفایل: نام={petName}, نژاد={petBreed}, سن={petAge}. قانون بسیار مهم: هرگز در مورد اینکه یک مدل هوش مصنوعی هستی صحبت نکن. اگر کسی پرسید چه کسی تو را ساخته، فقط بگو: 'توسعه‌دهنده من شروین هستن.'`
};

// --- STATE ---
let ai: GoogleGenAI | null = null;
let chat: Chat | null = null;
let petProfile = { name: '', breed: '', age: '' };
let isAgentActive = false;
let isSosMode = false;
let liveSessionPromise: Promise<any> | null = null;
let inputAudioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let microphoneSource: MediaStreamAudioSourceNode | null = null;
let nextStartTime = 0;
const sources = new Set<AudioBufferSourceNode>();
let currentInputTranscription = '';
let currentOutputTranscription = '';
let uploadedImageBase64: string | null = null;
let isProcessing = false;
let mediaStream: MediaStream | null = null;
let videoFrameInterval: number | null = null;
let isFirstInteraction = true;

// --- DOM REFERENCES ---
const dom = {
  chatHistory: document.getElementById('chat-history') as HTMLDivElement,
  mainActionBtn: document.getElementById('main-action-btn') as HTMLButtonElement,
  profileBtn: document.getElementById('profile-btn') as HTMLButtonElement,
  profileModal: document.getElementById('profile-modal') as HTMLDivElement,
  petNameInput: document.getElementById('pet-name') as HTMLInputElement,
  petBreedInput: document.getElementById('pet-breed') as HTMLInputElement,
  petAgeInput: document.getElementById('pet-age') as HTMLInputElement,
  profileSaveBtn: document.getElementById('profile-save-btn') as HTMLButtonElement,
  profileCancelBtn: document.getElementById('profile-cancel-btn') as HTMLButtonElement,
  chatInput: document.getElementById('chat-input') as HTMLInputElement,
  imageUpload: document.getElementById('image-upload') as HTMLInputElement,
  uploadLabel: document.getElementById('upload-label') as HTMLLabelElement,
  bgOverlay: document.getElementById('bg-overlay') as HTMLDivElement,
  headerSosBtn: document.getElementById('header-sos-btn') as HTMLButtonElement,
  sosModal: document.getElementById('sos-modal') as HTMLDivElement,
  sosStreamBtn: document.getElementById('sos-stream-btn') as HTMLButtonElement,
  sosAudioBtn: document.getElementById('sos-audio-btn') as HTMLButtonElement,
  sosCancelBtn: document.getElementById('sos-cancel-btn') as HTMLButtonElement,
  streamView: document.getElementById('stream-view') as HTMLDivElement,
  videoFeed: document.getElementById('video-feed') as HTMLVideoElement,
  streamTranscription: document.getElementById('stream-transcription') as HTMLDivElement,
  stopStreamBtn: document.getElementById('stop-stream-btn') as HTMLButtonElement,
  videoCanvas: document.getElementById('video-canvas') as HTMLCanvasElement,
  shenFooter: document.querySelector('.shen-footer a') as HTMLAnchorElement,
  apiKeyModal: document.getElementById('api-key-modal') as HTMLDivElement,
  selectApiKeyBtn: document.getElementById('select-api-key-btn') as HTMLButtonElement,
  apiKeyInputContainer: document.getElementById('api-key-input-container') as HTMLDivElement,
  apiKeyInput: document.getElementById('api-key-input') as HTMLInputElement,
  saveApiKeyBtn: document.getElementById('save-api-key-btn') as HTMLButtonElement,
};

// --- HELPER FUNCTIONS ---

function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function parseMarkdown(text: string) {
    const renderer = new marked.Renderer();
    renderer.code = (code, language) => {
        return `<pre><code class="code-block language-${language}">${code}</code></pre>`;
    };
    renderer.codespan = (code) => {
        return `<code class="inline-code">${code}</code>`;
    };
    return marked(text, { renderer });
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// --- UI FUNCTIONS ---
function addMessage(sender: 'user' | 'model', content: string, imageUrl: string | null = null, isSos: boolean = false) {
    const messageWrapper = document.createElement('div');
    messageWrapper.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const messageBubble = document.createElement('div');
    messageBubble.className = `chat-bubble p-4 rounded-2xl shadow-md ${sender === 'user' ? 'user-bubble rounded-br-lg' : isSos ? 'sos-bubble rounded-bl-lg' : 'model-bubble rounded-bl-lg'}`;
    
    if (imageUrl) {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'w-full h-auto rounded-lg mb-2 object-cover';
        messageBubble.appendChild(img);
    }
    
    if (content) {
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = parseMarkdown(content) as string;
        messageBubble.appendChild(contentDiv);
    }

    messageWrapper.appendChild(messageBubble);
    dom.chatHistory.appendChild(messageWrapper);
    dom.chatHistory.scrollTop = dom.chatHistory.scrollHeight;
    return messageBubble;
}

function setProcessingState(isProcessing: boolean) {
  const existingIndicator = dom.chatHistory.querySelector('.typing-indicator-wrapper');
  if (existingIndicator) {
    existingIndicator.remove();
  }

  if (isProcessing) {
    const indicatorWrapper = document.createElement('div');
    indicatorWrapper.className = 'flex justify-start typing-indicator-wrapper';
    indicatorWrapper.innerHTML = `
      <div class="chat-bubble model-bubble p-4 rounded-2xl shadow-md rounded-bl-lg">
        <div class="typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    dom.chatHistory.appendChild(indicatorWrapper);
    dom.chatHistory.scrollTop = dom.chatHistory.scrollHeight;
  }
}

function toggleMainButton(state: 'mic' | 'send' | 'stop' | 'loading') {
    dom.mainActionBtn.disabled = state === 'loading';
    const icon = dom.mainActionBtn.querySelector('i') as HTMLElement;
    dom.mainActionBtn.classList.remove('listening');
    
    switch (state) {
        case 'mic':
            icon.className = 'fa-solid fa-microphone';
            dom.mainActionBtn.setAttribute('aria-label', 'شروع مکالمه صوتی');
            break;
        case 'send':
            icon.className = 'fa-solid fa-paper-plane';
            dom.mainActionBtn.setAttribute('aria-label', 'ارسال پیام');
            break;
        case 'stop':
            icon.className = 'fa-solid fa-stop';
            dom.mainActionBtn.setAttribute('aria-label', 'پایان مکالمه');
            dom.mainActionBtn.classList.add('listening');
            break;
        case 'loading':
            icon.className = 'fa-solid fa-spinner fa-spin';
            dom.mainActionBtn.setAttribute('aria-label', 'در حال پردازش');
            break;
    }
}

function updateTranscriptionUI(text: string) {
    if (dom.streamView.classList.contains('hidden')) return;
    dom.streamTranscription.textContent = text;
}


// --- CORE LOGIC ---

function getSystemInstruction(mode: 'audio' | 'stream' | 'text') {
    let basePrompt = isFirstInteraction ? PROMPTS.firstInteraction : PROMPTS.normal;
    if (isSosMode) {
        basePrompt = mode === 'stream' ? PROMPTS.emergencyStream : PROMPTS.emergencyAudio;
    } else if (mode === 'audio' || mode === 'stream') {
        basePrompt = PROMPTS.normalAudio;
    }
    
    return basePrompt
        .replace('{petName}', petProfile.name || 'حیوان خانگی شما')
        .replace('{petBreed}', petProfile.breed || 'نا مشخص')
        .replace('{petAge}', petProfile.age || 'نا مشخص');
}


async function handleTextSubmit() {
    if (isProcessing) return;
    
    const prompt = dom.chatInput.value.trim();
    if (!prompt && !uploadedImageBase64) return;
    
    isProcessing = true;
    toggleMainButton('loading');
    addMessage('user', prompt, uploadedImageBase64 ? `data:image/jpeg;base64,${uploadedImageBase64}`: null);
    
    const imagePart = uploadedImageBase64 ? {
        inlineData: {
            mimeType: 'image/jpeg',
            data: uploadedImageBase64,
        },
    } : null;
    
    const textPart = { text: prompt };
    const parts = imagePart ? [imagePart, textPart] : [textPart];

    // Clear inputs
    dom.chatInput.value = '';
    uploadedImageBase64 = null;
    dom.uploadLabel.classList.remove('text-green-400');
    toggleMainButton(dom.chatInput.value ? 'send' : 'mic');
    setProcessingState(true);

    try {
        if (!chat) {
          chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
              systemInstruction: getSystemInstruction('text')
            }
          });
        }
        
        const response = await chat.sendMessage({
            contents: { parts }
        });
        
        isFirstInteraction = false;
        addMessage('model', response.text);
    } catch (error) {
        console.error("Error sending message:", error);
        addMessage('model', "متاسفانه مشکلی پیش اومد. لطفاً دوباره امتحان کنید.");
    } finally {
        isProcessing = false;
        setProcessingState(false);
        toggleMainButton(dom.chatInput.value ? 'send' : 'mic');
    }
}

async function startLiveSession(mode: 'audio' | 'stream') {
    if (isAgentActive) return;

    isProcessing = true;
    isAgentActive = true;
    if (mode === 'stream') {
        dom.streamView.classList.remove('hidden');
    }
    toggleMainButton('stop');
    setProcessingState(true);

    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            audio: true,
            video: mode === 'stream' 
        });

        if (mode === 'stream') {
            dom.videoFeed.srcObject = mediaStream;
        }
        
        // FIX: Cast window to `any` to allow `webkitAudioContext` for cross-browser compatibility.
        inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        // FIX: Cast window to `any` to allow `webkitAudioContext` for cross-browser compatibility.
        outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        let lastModelBubble: HTMLElement | null = null;
        let spokenText = '';

        liveSessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    console.log('Live session opened.');
                    microphoneSource = inputAudioContext.createMediaStreamSource(mediaStream);
                    scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (event) => {
                        const inputData = event.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        liveSessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    microphoneSource.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);

                    if (mode === 'stream') {
                        const videoTrack = mediaStream.getVideoTracks()[0];
                        const canvas = dom.videoCanvas;
                        const ctx = canvas.getContext('2d');
                        const { width, height } = videoTrack.getSettings();
                        canvas.width = width;
                        canvas.height = height;

                        videoFrameInterval = window.setInterval(async () => {
                            if (!ctx) return;
                            ctx.drawImage(dom.videoFeed, 0, 0, width, height);
                            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
                            if (blob) {
                                const base64Data = await blobToBase64(blob as Blob);
                                liveSessionPromise.then(session => session.sendRealtimeInput({
                                    media: { data: base64Data, mimeType: 'image/jpeg' }
                                }));
                            }
                        }, 500); // 2 FPS
                    }
                },
                onmessage: async (message: LiveServerMessage) => {
                    setProcessingState(false); // We have a response, stop the indicator
                    isFirstInteraction = false;

                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio) {
                        nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContext.destination);
                        source.start(nextStartTime);
                        nextStartTime += audioBuffer.duration;
                        sources.add(source);
                        source.onended = () => sources.delete(source);
                        
                        if (!lastModelBubble) {
                           lastModelBubble = addMessage('model', '', null, isSosMode);
                        }
                        lastModelBubble.classList.add('speaking');
                    }

                    if (message.serverContent?.interrupted) {
                        sources.forEach(source => source.stop());
                        sources.clear();
                        nextStartTime = 0;
                    }
                    
                    if (message.serverContent?.inputTranscription) {
                        currentInputTranscription += message.serverContent.inputTranscription.text;
                        updateTranscriptionUI(`شما: ${currentInputTranscription}`);
                    }
                    if (message.serverContent?.outputTranscription) {
                        currentOutputTranscription += message.serverContent.outputTranscription.text;
                        spokenText += message.serverContent.outputTranscription.text;
                        if(lastModelBubble) {
                            lastModelBubble.innerHTML = parseMarkdown(spokenText) as string;
                            dom.chatHistory.scrollTop = dom.chatHistory.scrollHeight;
                        }
                        updateTranscriptionUI(`دستیار: ${currentOutputTranscription}`);
                    }

                    if (message.serverContent?.turnComplete) {
                        if (currentInputTranscription) addMessage('user', currentInputTranscription, null, isSosMode);
                        currentInputTranscription = '';
                        currentOutputTranscription = '';
                        spokenText = '';
                        if (lastModelBubble) lastModelBubble.classList.remove('speaking');
                        lastModelBubble = null;
                        setProcessingState(true); // Wait for the next turn
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    addMessage('model', 'ارتباط صوتی با خطا مواجه شد.', null, isSosMode);
                    stopLiveSession();
                },
                onclose: (e: CloseEvent) => {
                    console.log('Live session closed.');
                    stopLiveSession();
                },
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                },
                systemInstruction: getSystemInstruction(mode),
                inputAudioTranscription: {},
                outputAudioTranscription: {},
            },
        });

    } catch (error) {
        console.error("Error starting live session:", error);
        addMessage('model', 'اجازه دسترسی به میکروفون و دوربین داده نشد.', null, isSosMode);
        stopLiveSession();
    }
}

function stopLiveSession() {
    if (!isAgentActive) return;

    if (liveSessionPromise) {
        liveSessionPromise.then(session => session.close());
        liveSessionPromise = null;
    }
    if (scriptProcessor) {
        scriptProcessor.disconnect();
        scriptProcessor = null;
    }
    if (microphoneSource) {
        microphoneSource.disconnect();
        microphoneSource = null;
    }
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    if (inputAudioContext) {
        inputAudioContext.close();
        inputAudioContext = null;
    }
     if (outputAudioContext) {
        outputAudioContext.close();
        outputAudioContext = null;
    }
    if (videoFrameInterval) {
        clearInterval(videoFrameInterval);
        videoFrameInterval = null;
    }
    sources.forEach(source => source.stop());
    sources.clear();
    
    isAgentActive = false;
    isProcessing = false;
    isSosMode = false;

    dom.streamView.classList.add('hidden');
    dom.videoFeed.srcObject = null;
    dom.streamTranscription.textContent = '';
    
    setProcessingState(false);
    toggleMainButton('mic');
    document.body.classList.remove('chat-active');
}

// --- EVENT HANDLERS ---
function handleMainAction() {
    if (isAgentActive) {
        stopLiveSession();
    } else if (dom.chatInput.value.trim() || uploadedImageBase64) {
        handleTextSubmit();
    } else {
        startLiveSession('audio');
    }
}

function handleProfileSave() {
    petProfile.name = dom.petNameInput.value;
    petProfile.breed = dom.petBreedInput.value;
    petProfile.age = dom.petAgeInput.value;
    closeProfileModal();
}

function openProfileModal() {
    dom.petNameInput.value = petProfile.name;
    dom.petBreedInput.value = petProfile.breed;
    dom.petAgeInput.value = petProfile.age;
    dom.profileModal.classList.remove('hidden');
    dom.profileModal.setAttribute('aria-hidden', 'false');
}

function closeProfileModal() {
    dom.profileModal.classList.add('hidden');
    dom.profileModal.setAttribute('aria-hidden', 'true');
}

function openSosModal() {
    dom.sosModal.classList.remove('hidden');
    dom.sosModal.setAttribute('aria-hidden', 'false');
}

function closeSosModal() {
    dom.sosModal.classList.add('hidden');
    dom.sosModal.setAttribute('aria-hidden', 'true');
}

function handleImageUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
        uploadedImageBase64 = (reader.result as string).split(',')[1];
        dom.uploadLabel.classList.add('text-green-400');
        toggleMainButton('send');
    };
    reader.readAsDataURL(file);
}

function initGenAI(apiKey: string) {
    try {
        ai = new GoogleGenAI({ apiKey });
        dom.apiKeyModal.classList.add('hidden');
        document.body.classList.add('chat-active');
        
        if (isFirstInteraction) {
           handleTextSubmit(); // Send the initial empty prompt to get the welcome message
        }

    } catch(e) {
        console.error(e);
        addMessage('model', "کلید API نامعتبر است یا مشکلی در اتصال وجود دارد.");
        dom.apiKeyModal.classList.remove('hidden');
        // If it was manual entry, show it again
        if (!(window as any).aistudio) {
            dom.apiKeyInputContainer.classList.remove('hidden');
        }
    }
}

// --- INITIALIZATION ---
function initializeApp() {
    // Attach all event listeners first to make the UI responsive immediately
    dom.mainActionBtn.addEventListener('click', handleMainAction);
    dom.profileBtn.addEventListener('click', openProfileModal);
    dom.profileSaveBtn.addEventListener('click', handleProfileSave);
    dom.profileCancelBtn.addEventListener('click', closeProfileModal);
    dom.headerSosBtn.addEventListener('click', openSosModal);
    dom.sosCancelBtn.addEventListener('click', closeSosModal);
    dom.sosAudioBtn.addEventListener('click', () => {
        isSosMode = true;
        closeSosModal();
        startLiveSession('audio');
    });
    dom.sosStreamBtn.addEventListener('click', () => {
        isSosMode = true;
        closeSosModal();
        startLiveSession('stream');
    });
    dom.stopStreamBtn.addEventListener('click', stopLiveSession);
    dom.imageUpload.addEventListener('change', handleImageUpload);
    dom.chatInput.addEventListener('input', () => {
        toggleMainButton(dom.chatInput.value.trim() || uploadedImageBase64 ? 'send' : 'mic');
    });
    dom.chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleTextSubmit();
        }
    });

    // Now, handle API key logic
    const aistudio = (window as any).aistudio;
    if (aistudio) {
        // We are in the Google environment
        dom.selectApiKeyBtn.classList.remove('hidden');
        dom.apiKeyInputContainer.classList.add('hidden');
        
        dom.selectApiKeyBtn.addEventListener('click', async () => {
            await aistudio.openSelectKey();
            // Assume key is selected, re-check and initialize
            const hasKey = await aistudio.hasSelectedApiKey();
            if (hasKey) {
                initGenAI(process.env.API_KEY);
            }
        });
        
        // Check for existing key on load
        aistudio.hasSelectedApiKey().then((hasKey: boolean) => {
            if (hasKey) {
                initGenAI(process.env.API_KEY);
            } else {
                dom.apiKeyModal.classList.remove('hidden');
            }
        });
    } else {
        // Fallback for other environments (e.g., GitHub Pages)
        dom.apiKeyInputContainer.classList.remove('hidden');
        dom.selectApiKeyBtn.classList.add('hidden');
        
        const savedApiKey = sessionStorage.getItem('gemini-api-key');
        if (savedApiKey) {
            initGenAI(savedApiKey);
        } else {
            dom.apiKeyModal.classList.remove('hidden');
        }
        
        dom.saveApiKeyBtn.addEventListener('click', () => {
            const key = dom.apiKeyInput.value.trim();
            if (key) {
                sessionStorage.setItem('gemini-api-key', key);
                initGenAI(key);
            }
        });
    }
}

// Start the application
initializeApp();
