const inputMessage = document.getElementById('subject-input')
const answersQuest = document.getElementById('questionnaire-answers')
const CorrectQuest = document.getElementById('questionnaire-correction')

const templates = { // Templates para a IA usar de base
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

function mostrar(questao, num) { // Mostrar as questões criadas por IA
    clear()
    questao.forEach((q, i) => { // Questão

        console.log(q)

        const div = document.createElement('div')
        const lst = document.createElement('ul')
        const enc = document.createElement('h2')

        enc.setAttribute('name', 'Enunciado')
        enc.textContent = q.enunciado

        div.name = "questao"
        div.setAttribute('class', 'answers')
        div.appendChild(enc)

        if (q.criterios) { // Descritiva
            const inp = document.createElement('textarea')
            inp.placeholder = 'Digite sua resposta...'
            inp.classList.add('descritive-input')

            const crt = document.createElement('h3')
            crt.name = "Criterios"
            crt.textContent = q.criterios

            div.appendChild(crt)
            div.appendChild(inp)
        }

        if (q.alternativas) { // Múlpipla escolha
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
            })
        }

        if (q.tipo == 'Verdadeiro ou falso') { // V ou F
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
        }

        answersQuest.appendChild(div)
    })

    const corr = document.createElement('button')
    corr.onclick = () => corrigir()
    corr.textContent = "Corrigir"
    corr.classList.add('correction-button')
    answersQuest.appendChild(corr)
}

async function corrigir() {
    
    const questoes = document.querySelectorAll('.answers')
    const respostas = [];
    

    questoes.forEach((div, i) => {
        const radioSelecionado = div.querySelector('input[type="radio"]:checked')
        const enunciado = div.querySelector('[name="Enunciado"]')
        const inputDescritiva = div.querySelector('textarea')

        let valorFinal = null;

        if (radioSelecionado) {
            valorFinal = radioSelecionado.value
        } else if (inputDescritiva) {
            let criterios = div.querySelector('[name="Criterios"]')
            let esperado = div.querySelector('[name="Esperado"]')
            valorFinal = inputDescritiva.value
        }

        respostas.push({
            questao: i,
            enunciado: enunciado,
            resposta: valorFinal
        });
    });

    console.log("Respostas coletadas com sucesso:", respostas);

    const correcao = document.createElement('pre')
    correcao.textContent = JSON.stringify(await enviar(
        "Sua função é corrigir questões respondidas pelo usuário e dar um feedback sobre seus erros e acertos, responda apenas em json válido, sem nada adicional.",
        respostas, null), null, 2)

    CorrectQuest.appendChild(correcao)
    return respostas
}

const templatesArray = Object.values(templates)

function clear() { // Remover questões antigas
    answersQuest.innerHTML = '';
}


async function enviar(sistema, usuario, num) {

    const token = document.getElementById('key').value
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', { // Enviar para os servers da groq
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
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
    return questao
}

const sendButton = document.getElementById('send-button')

inputMessage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendButton.click()
})

sendButton.addEventListener('click', async () => {
    const num = Number(document.getElementById('questions-input').value)
    const msg = inputMessage.value
    const tem = JSON.stringify(templatesArray, null, 2)
    const feedback = await enviar(
        "Sua função é criar questões sobre um assunto escolhido com base em templates prontos, responda apenas em json válido, sem nada adicional.",
        `Crie ${num} questões sobre o tema "${msg}", preencha os campos e retorne o json completo.
        Template: ${tem}`,
        num)
    mostrar(feedback, num)
})