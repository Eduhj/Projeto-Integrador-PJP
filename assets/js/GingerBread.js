const inputMessage = document.getElementById('subject-input')
const answersQuest = document.getElementById('questionnaire-answers')

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
        resposta_esperada: ""
    }
}



function corrigir() {
    // Seleciona todas as divs de questões
    const questoes = document.querySelectorAll('.answers');
    const respostas = [];

    questoes.forEach((div, i) => {
        // PROCURA LOCAL: Busca qualquer rádio checado DENTRO desta div
        const radioSelecionado = div.querySelector('input[type="radio"]:checked');
        
        // PROCURA LOCAL: Busca campo de texto DENTRO desta div
        const inputDescritiva = div.querySelector('input[type="text"]');

        let valorFinal = null;

        if (radioSelecionado) {
            // Se for rádio, pegamos o valor (será '0', '1', 'true', 'false', etc)
            valorFinal = radioSelecionado.value;
        } else if (inputDescritiva) {
            // Se for texto, pegamos o que foi digitado
            valorFinal = inputDescritiva.value;
        }

        respostas.push({
            questao: i,
            resposta: valorFinal
        });
    });

    console.log("Respostas coletadas com sucesso:", respostas);
    return respostas;
}

const templatesArray = Object.values(templates)

function clear() { // Remover questões antigas
    answersQuest.innerHTML = '';
}

function mostrar(questao, num) { // Mostrar as questões criadas por IA
    clear()
    questao.forEach((q, i) => { // Questão

        console.log(q)

        const div = document.createElement('div')
        const lst = document.createElement('ul')
        const enc = document.createElement('h2')

        enc.textContent = q.enunciado

        div.name = "questao"
        div.setAttribute('class', 'answers')
        div.appendChild(enc)

        if (q.criterios) { // Descritiva
            const crt = document.createElement('h3')
            const inp = document.createElement('input')
            inp.type = "text"
            crt.textContent = q.criterios
            div.appendChild(crt)
            div.appendChild(inp)
        }

        if (q.alternativas) { // Múlpipla escolha
            q.alternativas.forEach((a, u) => {
                const label = document.createElement('label')
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
            const lf = document.createElement('label')

            const v = document.createElement('input')
            const f = document.createElement('input')

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
    answersQuest.appendChild(corr)
}

async function enviar() {
    const token = document.getElementById('key').value
    const num = document.getElementById('questions-input').value

    const msg = inputMessage.value

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
                content: "Sua função é criar questões sobre um assunto escolhido com base em templates prontos, responda apenas em json válido, sem nada adicional."
            },
            {
                role: "user", content: `Crie ${num} questões sobre o tema "${msg}", preencha os campos e retorne o json completo.
                Template: ${JSON.stringify(templatesArray, null, 2)}`
            }]
        })
    })

    const data = await res.json()
    const texto = data.choices[0].message.content
    const limpo = texto.replace(/```json|```/g, "").trim()
    const questao = JSON.parse(limpo)
    mostrar(questao, num)
}

const sendButton = document.getElementById('send-button')

inputMessage.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendButton.click()
})

sendButton.addEventListener('click', enviar)
