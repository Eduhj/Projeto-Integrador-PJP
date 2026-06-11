const inputMessage = document.getElementById('subject-input')
const answersQuest = document.getElementById('questionnaire-answers')
const CorrectQuest = document.getElementById('questionnaire-correction')
const clearButton = document.getElementById('clear-button')
const sendButton = document.getElementById('send-button')

const templates = {
    MultEsc: {
        tipo: "Multipla escolha",
        enunciado: "",
        alternativas: ["", "", "", ""],
        gabarito: 0
    },

    VddouFls: {
        tipo: "Verdadeiro ou falso",
        enunciado: "",
        gabarito: true
    },

    Descrito: {
        tipo: "Descritiva",
        enunciado: "",
        criterios: "",
    }
}

const correction_templates = {
    MultEsc: {
        tipo: "Multipla escolha",
        enunciado: "",
        alternativa_correta: "",
        alternativa_escolhida: "",
        feedback: ""
    },

    VddouFls: {
        tipo: "Verdadeiro ou falso",
        enunciado: "",
        alternativa_correta: "",
        alternativa_escolhida: "",
    },

    Descrito: {
        tipo: "Descritiva",
        enunciado: "",
        criterios: "",
        feedback: ""
    }
}

function importQuestionsStorage() {
    const questionsStorage = localStorage.getItem('questions');

    if (questionsStorage) {
        try {
            const questionsArray = JSON.parse(questionsStorage);

            if (Array.isArray(questionsArray) && questionsArray.length > 0) {
                showQuestions(questionsArray, questionsArray.length);
            }
        } catch (erro) {
            console.error("Erro ao ler as questões do Local Storage:", erro);
        }
    }
}

function clearQuests(limparStorage = false) {
    answersQuest.innerHTML = '';
    CorrectQuest.innerHTML = '';
    if (limparStorage) localStorage.removeItem('questions');
}

let perguntas = []

function showQuestions(questao, questionsNumber) {
    clearQuests()
    perguntas = []

    questao.forEach((q, i) => {

        const div = document.createElement('div')
        const lst = document.createElement('ul')
        const enc = document.createElement('h2')

        enc.setAttribute('name', 'Enunciado')
        enc.textContent = q.enunciado

        div.name = "questao"
        div.setAttribute('class', 'answers')
        div.appendChild(enc)

        perguntas.push({
            questao: i,
            enunciado: q.enunciado
        })

        if (q.criterios) {
            const inp = document.createElement('textarea')
            inp.placeholder = 'Digite sua resposta...'
            inp.classList.add('descritive-input')

            const crt = document.createElement('h3')
            crt.name = "Criterios"
            crt.textContent = q.criterios

            div.appendChild(crt)
            div.appendChild(inp)

            perguntas.push({
                questao: i,
                criterios: q.criterios
            })
        }

        if (q.alternativas) {
            q.alternativas.forEach((a, u) => {
                const label = document.createElement('label')
                label.setAttribute('class', 'question-radio')
                const alt = document.createElement('input')

                alt.type = "radio"
                alt.name = `questao_${i}`
                alt.value = u
                label.appendChild(alt)
                label.append(a)
                div.appendChild(label)

                perguntas.push({
                    questao: i,
                    tipo: q.tipo,
                    gabarito: q.gabarito
                })
            })
        }

        if (q.tipo == 'Verdadeiro ou falso') {
            const lv = document.createElement('label')
            lv.setAttribute('class', 'true-label-quest')
            const lf = document.createElement('label')
            lf.setAttribute('class', 'false-label-quest')

            const v = document.createElement('input')
            v.setAttribute('class', 'radio-input')
            const f = document.createElement('input')
            f.setAttribute('class', 'radio-input')

            v.type = "radio"
            f.type = "radio"
            v.name = `questao_${i}`
            f.name = `questao_${i}`

            v.value = true
            f.value = false

            lv.appendChild(v)
            lv.append(' ✔️')

            lf.appendChild(f)
            lf.append(' ❌')

            div.appendChild(lv)
            div.appendChild(lf)

            perguntas.push({
                questao: i,
                tipo: q.tipo,
                gabarito: q.gabarito
            })
        }

        answersQuest.appendChild(div)
    })

    const corr = document.createElement('button')
    corr.textContent = "Corrigir"
    corr.classList.add('correction-button')
    answersQuest.appendChild(corr)
}

function showCorrection(corr) {
    corr.forEach((c) => {

    })
}

function renderCorrecao(dados, container) {
    const questoes = Array.isArray(dados) ? dados : (dados.questoes || []);
    const acertos = questoes.filter(q => q.acerto).length;
    const erros = questoes.length - acertos;
    const pct = questoes.length ? Math.round((acertos / questoes.length) * 100) : 0;

    let html = `
    <div class="resumo">
        <div class="metric"><div class="num verde">${acertos}</div><div class="lbl">acertos</div></div>
        <div class="metric"><div class="num vermelho">${erros}</div><div class="lbl">erros</div></div>
        <div class="metric"><div class="num">${pct}%</div><div class="lbl">aproveitamento</div></div>
    </div>`;

    questoes.forEach(q => {
        html += `
      <div class="questao-card">
        <div class="questao-header">
            <span>Questão ${q.numero + 1}</span>
            <span class="badge ${q.acerto ? 'badge-acerto' : 'badge-erro'}">${q.acerto ? '✓ Correto' : '✗ Incorreto'}</span>
        </div>
        ${q.enunciado ? `<p>${q.enunciado}</p>` : ''}
        <div><span>Sua resposta:</span> ${q.resposta_usuario ?? '—'}</div>
        ${q.gabarito != null ? `<div><span>Gabarito:</span> ${q.gabarito}</div>` : ''}
        ${q.feedback ? `<div class="feedback-box">${q.feedback}</div>` : ''}
      </div>`;
    });

    container.innerHTML = html;
}

async function corrigir() {
    const questoes = document.querySelectorAll('.answers')
    const respostas = [];

    questoes.forEach((div, i) => {
        const radioSelecionado = div.querySelector('input[type="radio"]:checked')
        const enunciado = div.querySelector('[name="Enunciado"]')
        const inputDescritiva = div.querySelector('textarea')
        const criterios = div.querySelector('[name="Criterios"]')

        const dadosQuestao = perguntas.find(p => p.questao === i && p.gabarito !== undefined)

        let valorFinal = null;

        if (radioSelecionado) {
            valorFinal = radioSelecionado.value
        } else if (inputDescritiva) {
            valorFinal = inputDescritiva.value
        }

        respostas.push({
            questao: i,
            enunciado: enunciado?.textContent ?? '',
            criterios: criterios?.textContent ?? null,
            gabarito: dadosQuestao?.gabarito ?? null,
            resposta: valorFinal
        });
    });

    console.log("Respostas coletadas com sucesso:", respostas);

    const resultado = await enviar(`Sua funcao e corrigir questoes respondidas pelo usuario e dar um feedback sobre seus erros e acertos.
   Responda APENAS em JSON valido, sem nada adicional, no seguinte formato:
   {
     "questoes": [
       {
         "numero": 1,
         "enunciado": "...",
         "resposta_usuario": "...",
         "gabarito": "...",
         "acerto": true,
         "feedback": "..."
       }
     ]
   }
   Quando gabarito nao for null, compare seu valor com a resposta. Quando houver, substitua os valores de alternativas (0, 1, 2, 3) por (a, b, c, d) e (true/false) por (verdadeiro/falso)`,
        JSON.stringify(respostas), null, false)
    renderCorrecao(resultado, CorrectQuest)

    return respostas
}

const templatesArray = Object.values(templates)

async function enviar(sistema, usuario, questionsNumber, salvar = true) {

    const token = document.getElementById('key').value
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            messages: [{
                role: "system",
                content: String(sistema)
            },
            {
                role: "user", content: String(usuario)
            }]
        })
    })


    const data = await res.json()
    const texto = data.choices[0].message.content
    const limpo = texto.replace(/```json|```/g, "").trim()
    const questao = JSON.parse(limpo)

    if (salvar) {
        localStorage.setItem('questions', JSON.stringify(questao))
    }

    return questao
}

async function sendQuestions() {
    const questionsNumber = Number(document.getElementById('questions-input').value)
    const msg = inputMessage.value
    const tem = JSON.stringify(templatesArray, null, 2)
    const feedback = await enviar(
        "Sua funcao e criar questoes sobre um assunto escolhido com base em templates prontos, responda apenas em json valido, sem nada adicional.",
        `Crie ${questionsNumber} questoes sobre o tema "${msg}", preencha os campos e retorne o json completo.
        Template: ${tem} ; (cuidado para nao dar a resposta ao adicionar um criterio, ele deve ser usado apenas como direcionamento para o usuario)`,
        questionsNumber)
    showQuestions(feedback, questionsNumber)
}

inputMessage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendButton.click()
})

document.addEventListener('click', (e) => {
    const target = e.target

    if (target.id === 'send-button') sendQuestions()
    if (target.id === 'clear-button') clearQuests(true)
    if (target.classList.contains('correction-button')) corrigir()
})

importQuestionsStorage()