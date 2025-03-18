"use client";
import { useState, useEffect, useRef } from "react";
import curriculo from "./api/chat/curriculo.json";
import { useTheme } from "./context/ThemeContext";

const getImagePath = (path) => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${basePath}${path}`;
};

const isGitHubPages = () => {
  return window.location.hostname.includes('github.io');
};

export default function Home() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", content: "Olá! Sou um chatbot treinado para responder dúvidas sobre o meu portfólio e minha experiência profissional." },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [typingText, setTypingText] = useState("");
  const [isGitHubPagesEnv, setIsGitHubPagesEnv] = useState(false);

  const scrollAreaRef = useRef(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  const typeText = (text, onComplete) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        setTypingText((prev) => prev + text.charAt(index));
        index++;
      } else {
        clearInterval(interval);
        if (onComplete) onComplete();
      }
    }, 50); 
  };

  const formatResponse = (text) => {
    // Remove o JSON bruto se estiver presente
    if (text.includes('```json')) {
        text = text.replace(/```json\n?|\n?```/g, '');
    }
    
    // Remove o \boxed{} se estiver presente
    const regex = /\\boxed\{([^}]+)\}/;
    const match = text.match(regex);
    if (match) {
        text = match[1];
    }

    // Remove aspas extras e espaços desnecessários
    text = text.replace(/^"+|"+$/g, '');
    text = text.trim();
    text = text.replace(/\s+/g, ' ');

    // Formata o texto para ficar mais conversacional
    text = text.replace(/\n/g, ' ');
    text = text.replace(/\*\*/g, '');
    text = text.replace(/\*/g, '');
    text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    text = text.replace(/###/g, '');
    text = text.replace(/####/g, '');
    text = text.replace(/-/g, '•');

    // Adiciona pontuação adequada
    text = text.replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2');
    
    // Remove espaços múltiplos
    text = text.replace(/\s+/g, ' ');
    
    return text;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  useEffect(() => {
    setIsGitHubPagesEnv(isGitHubPages());
  }, []);

  const toggleMobileMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: inputMessage }]);
    setInputMessage("");
    
    setIsLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://dutradev28.github.io/portfolio-dev-rpa",
          "X-Title": "Chatbot"
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-zero:free",
          messages: [
            {
              role: "system",
              content: `Você é um assistente que responde perguntas sobre o currículo de Luis Carlos Dutra Junior. Use as seguintes informações:

${JSON.stringify(curriculo, null, 2)}

Regras para respostas:
1. Seja direto e conciso
2. Evite repetições
3. Destaque apenas informações relevantes
4. Use linguagem simples e clara
5. Limite a resposta a 2-3 parágrafos
6. Mantenha um tom profissional mas amigável`
            },
            {
              role: "user",
              content: inputMessage
            }
          ]
        }),
      });

      const data = await response.json();

      const regex = /\\boxed\{([^}]+)\}/;
      const match = data.choices[0].message.content.match(regex);
      
      let botResponse = data.choices[0].message.content;
      
      // Remove o JSON bruto se estiver presente
      if (botResponse.includes('```json')) {
        botResponse = botResponse.replace(/```json\n?|\n?```/g, '');
      }
      
      // Remove o \boxed{} se estiver presente
      if (match) {
        botResponse = match[1];
      }

      const formattedResponse = formatResponse(botResponse);

      setTypingText("");

      typeText(formattedResponse, () => {
        setMessages((prev) => [...prev, { role: "bot", content: formattedResponse }]);
        setTypingText(""); 
        setIsLoading(false);
      });
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages((prev) => [...prev, { role: "bot", content: "Desculpe, ocorreu um erro ao processar sua mensagem." }]);
      setIsLoading(false);
    }
  };

  return (
    <>
      <header>
          <a href="#" className="logo-holder">
              {/* <!-- <div className="logo">L</div>
              <div className="logo-text">Portfolio Website</div> --> */}
          </a>
          <nav>
              <ul id="menu" className={menuOpen ? "active" : ""}>
                  <li>
                      <a href="#">Home</a>
                  </li>
                  <li>
                      <a href="#skills">Skills</a>
                  </li>
                  <li>
                      <a href="#projects">Projetos</a>
                  </li>
                  <li>
                      <a href="mailto:luiscarlosdutrajunior23@gmail.com" className="button">Contato</a>
                  </li>
              </ul>
              <div className="nav-buttons">
                <button className="theme-toggle" onClick={toggleTheme}>
                  {isDarkMode ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
                <a href="#" className="mobile-toggle" onClick={toggleMobileMenu}>
                  <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M5 7h14M5 12h14M5 17h10"/>
                  </svg>                  
                </a>
              </div>
          </nav>
      </header>
      <main>
          <section className="hero container">
              <div className="hero-blue">
                  <h1><small>Olá, Eu sou o Luis Carlos!</small>
                  </h1>
                  <p>Desenvolvedor Python com experiência em automação de processos, integração de APIs e desenvolvimento de soluções escaláveis.<span>Trabalho com tecnologias como Python, FastAPI, Celery, Selenium, AWS e banco de dados. Meu foco é otimizar tarefas repetitivas, criar soluções eficientes e melhorar fluxos de trabalho através da tecnologia.</span>
                  </p>
                  <div className="call-to-action">
                      <a href={getImagePath("/Currículo Luis Carlos.pdf")} target="_blank" className="button black">
                          Currículo
                      </a>
                      <a href="mailto:luiscarlosdutrajunior23@gmail.com" className="button white">
                          Contato
                      </a>
                      <a href="https://wa.me/5541998380354?text=Olá%20Luis%20Carlos%2C%20gostaria%20de%20conversar%20sobre%20oportunidades%20de%20trabalho." target="_blank" className="button whatsapp">
                          WhatsApp
                      </a>
                  </div>
                  <div className="social-links">
                      <a href="https://github.com/dutradev28" target="_blank">
                          <img src={getImagePath("/imgs/github.png")} alt="GitHub" width="48" />
                      </a>
                      <a href="https://www.linkedin.com/in/luis-carlos-dutra-junior-58a1a51b6/" target="_blank">
                          <img src={getImagePath("/imgs/linkedin.png")} alt="LinkedIn" width="48" />
                      </a>
                  </div>
              </div>
              <div className="hero-yellow">
                  <img src={getImagePath("/imgs/hero-image.png")} alt="Luis Carlos" width="100%" />
              </div>
          </section>
            <section className="logos container">
              <div className="marquee">
                <div className="track">
                  <img src={getImagePath("/imgs/html.png")} alt="HTML" width="128" height="128" />
                  <img src={getImagePath("/imgs/css.png")} alt="CSS" width="128" height="128" />
                  <img src={getImagePath("/imgs/javascript.png")} alt="JS" width="128" height="128" />
                  <img src={getImagePath("/imgs/angular.png")} alt="Angular" width="128" height="128" />
                  <img src={getImagePath("/imgs/RPA.png")} alt="RPA" width="128" height="128" />
                  <img src={getImagePath("/imgs/vscode.png")} alt="VSCODE" width="128" height="128" />
                  <img src={getImagePath("/imgs/git.png")} alt="Git" width="128" height="128" />
                  <img src={getImagePath("/imgs/python.png")} alt="PYTHON" width="128" height="128" />
                  <img src={getImagePath("/imgs/selenium.png")} alt="SELENIUM WEBDRIVER" width="128" height="128" />
                  <img src={getImagePath("/imgs/fastapi.png")} alt="FASTAPI" width="128" height="128" />
                  <img src={getImagePath("/imgs/celery.png")} alt="CELERY" width="128" height="128" />
                  <img src={getImagePath("/imgs/redis.png")} alt="REDIS" width="128" height="128" />
                  <img src={getImagePath("/imgs/linux.png")} alt="LINUX" width="128" height="128" />
                  <img src={getImagePath("/imgs/azure.png")} alt="AZURE" width="128" height="128" />
                  <img src={getImagePath("/imgs/html.png")} alt="HTML" width="128" height="128" />
                  <img src={getImagePath("/imgs/css.png")} alt="CSS" width="128" height="128" />
                  <img src={getImagePath("/imgs/javascript.png")} alt="JS" width="128" height="128" />
                  <img src={getImagePath("/imgs/angular.png")} alt="Angular" width="128" height="128" />
                  <img src={getImagePath("/imgs/RPA.png")} alt="RPA" width="128" height="128" />
                  <img src={getImagePath("/imgs/vscode.png")} alt="VSCODE" width="128" height="128" />
                  <img src={getImagePath("/imgs/git.png")} alt="Git" width="128" height="128" />
                  <img src={getImagePath("/imgs/python.png")} alt="PYTHON" width="128" height="128" />
                  <img src={getImagePath("/imgs/selenium.png")} alt="SELENIUM WEBDRIVER" width="128" height="128" />
                  <img src={getImagePath("/imgs/fastapi.png")} alt="FASTAPI" width="128" height="128" />
                  <img src={getImagePath("/imgs/celery.png")} alt="CELERY" width="128" height="128" />
                  <img src={getImagePath("/imgs/redis.png")} alt="REDIS" width="128" height="128" />
                  <img src={getImagePath("/imgs/linux.png")} alt="LINUX" width="128" height="128" />
                  <img src={getImagePath("/imgs/azure.png")} alt="AZURE" width="128" height="128" />
                </div>
              </div>
            </section>
          <section id="skills" className="skills container">
              <h2>
                  <small>Sobre Mim</small>
                  Skills
              </h2>
              <div className="holder-blue">
                  <div className="left-column">
                      <h3>Frontend</h3>
                      <ul>
                          <li>HTML</li>
                          <li>CSS</li>
                          <li>JavaScript</li>
                          <li>Angular</li>
                      </ul>
                      <h3>Backend</h3>
                      <ul>
                          <li>RPA (Robot Process Automation)</li>
                          <li>Python</li>
                          <li>Selenium</li>
                          <li>FastAPI</li>
                          <li>Celery</li>
                          <li>Redis</li>                        
                      </ul>
                  </div>
                  <div className="right-column">
                      <h3>Um pouco sobre mim</h3>                    
                      <p>
                          Desenvolvedor RPA com experiência na automação de processos empresariais, integração de sistemas e otimização de operações. Atuei na Tahto desenvolvendo automações para coleta e tratamento de dados, integração via APIs e monitoramento de processos. Atualmente, na OpenCON, foco no desenvolvimento de RPAs contábeis, APIs escaláveis e automação de fluxos críticos utilizando Python, Selenium, FastAPI e Celery. Minha missão é transformar tarefas manuais em processos eficientes e inteligentes.
                      </p>
                  </div>
              </div>
          </section>
          <section className="work-experience container">
              <h2>
                  <small>Recentes</small>
                  Experiências de Trabalho
              </h2>
              <div className="jobs">
                  <article>
                      <figure>
                          <div>
                              <img src={getImagePath("/imgs/contabilidade.jpeg")} alt="trabalho-1" width="100%" />
                              <figcaption>Jesus Oliveira Assessoria Contábil</figcaption>
                          </div>
                      </figure>
                      <h3>Jesus Oliveira Assessoria Contábil</h3>
                      <div>2018 - 2022</div>
                      <p>Assistente Departamento Pessoal</p>
                  </article>
                  <article>
                      <figure>
                          <div>
                              <img src={getImagePath("/imgs/tahto.jpg")} alt="trabalho-2" width="100%"/>
                              <figcaption>Tahto Soluções em CX/BPO</figcaption>
                          </div>
                      </figure>
                      <h3>Tahto Soluções em CX/BPO</h3>
                      <div>2022 - 2024</div>
                      <p>Analista I Desenvolvimento de Sistemas</p>
                  </article>
                  <article>
                      <figure>
                          <div>
                              <img src={getImagePath("/imgs/opencon.png")} alt="trabalho-3" width="100%"/>
                              <figcaption>OpenCON</figcaption>
                          </div>
                      </figure>
                      <h3>OpenCON Contabilidade Digital</h3>
                      <div>2024 - Atual</div>
                      <p>Desenvolvedor RPA Python</p>
                  </article>
              </div>
          </section>
          <section id="projects" className="bento container">
              <h2>
                  <small>
                      Anteriormente
                  </small>
                  Projetos Executados
              </h2>
              <div className="bento-grid">
                  <a href="#" className="bento-item">
                      <figure>
                          <img src={getImagePath("/imgs/emissornfse.png")} alt="RPA Emissão de NFSe" width="100%" />
                          <figcaption>RPA de Emissão de NFSe</figcaption>
                      </figure>
                  </a>
                  <a href="#" className="bento-item">
                      <figure>
                          <img src={getImagePath("/imgs/das.png")} alt="RPA para Guias DAS" width="100%" />
                          <figcaption>RPA para Guias DAS</figcaption>
                      </figure>
                  </a>
                  <a href="https://github.com/dutradev28/tahto-unificacao-FeederVeloxR2" target="_blank" className="bento-item">
                      <figure>
                          <img src={getImagePath("/imgs/unificacaodeferramentas.png")} alt="Unificação de Ferramentas" width="100%" />
                          <figcaption>Unificação de Ferramentas</figcaption>
                      </figure>
                  </a>
                  <a href="https://github.com/dutradev28/ProjetoMailingBO" target="_blank" className="bento-item">
                      <figure>
                          <img src={getImagePath("/imgs/mailingbo.png")} alt="Projeto Mailing BO" width="100%" />
                          <figcaption>Projeto Mailing BO</figcaption>
                      </figure>
                  </a>                
                  <a href="https://github.com/dutradev28/Automacao.checkauto.1_0_0_0" target="_blank" className="bento-item">
                      <figure>
                          <img src={getImagePath("/imgs/checkauto.png")} alt="Projeto CheckAuto" width="100%" />
                          <figcaption>Projeto CheckAuto</figcaption>
                      </figure>
                  </a>
                  <a href="#" className="bento-item">
                      <figure>
                          <img src={getImagePath("/imgs/dasn.png")} alt="RPA para Tratativa de Mailing" width="100%" />
                          <figcaption>RPA Declaração Anual (DASN-simei)</figcaption>
                      </figure>
                  </a>                
              </div>
          </section>
          <section className="chatbot container">
          <h2>
            <small>Converse comigo</small>
            Chatbot
          </h2>
          <div className="chatbot-blue">
            <div className="chat-info">
              <h3>DeepSeek R1 Chatbot</h3>
              <p>
                Este chatbot foi desenvolvido para responder perguntas sobre minha experiência, habilidades e trajetória profissional. Ele tem acesso ao meu currículo e pode fornecer informações detalhadas sobre os projetos em que trabalhei.
              </p>
              <p>Se quiser conhecer mais sobre meu perfil, interaja com o chatbot ou faça o download do meu currículo!</p>
              <a href={getImagePath("/Currículo Luis Carlos.pdf")} target="_blank" className="button black">
                Download Curriculo
              </a>
            </div>
            <div className="chat-box">
              <div className="scroll-area" ref={scrollAreaRef}>
                <ul id="chat-log">
                  {messages.map((msg, index) => (
                    <li key={index}>
                      <span className={`avatar ${msg.role}`}>
                        {msg.role === "bot" ? (
                          <img src={getImagePath("/imgs/deepseek.png")} alt="AI" width="64" height="64" />
                        ) : (
                          <img src={getImagePath("/imgs/user.png")} alt="User" width="64" height="64" />
                        )}
                      </span>
                      <div className="message">{msg.content}</div>
                    </li>
                  ))}
                  {isLoading && (
                    <li>
                      <span className="avatar bot">
                        <img src={getImagePath("/imgs/deepseek.png")} alt="AI" width="64" height="64" />
                      </span>
                      <div className="message">
                        {typingText}
                        <div className="cursor">|</div> 
                      </div>
                    </li>
                  )}
                </ul>
              </div>
              <div className="chat-message">
                <input
                  type="text"
                  placeholder="Digite sua pergunta sobre minha experiência..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isLoading}
                />
                <button className="button black" onClick={handleSendMessage} disabled={isLoading}>
                  {isLoading ? "Processando..." : "Enviar"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
