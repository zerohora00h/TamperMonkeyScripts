// ==UserScript==
// @name         FERRAMENTAS ADICIONAIS
// @version      1.38
// @description  FERRAMENTAS ADICIONAIS PARA O SISTEMA
// @author       ZeroHora
// @match        https://cadastrounico.caixa.gov.br/cadun/*
// @match        https://www.cadastrounico.caixa.gov.br/cadun/*
// @match        https://login.caixa.gov.br/auth/realms/internet/protocol/openid-connect/*
// @require      https://unpkg.com/pdf-lib/dist/pdf-lib.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        GM_getValue
// @grant        GM_setValue
// @updateURL    https://raw.githubusercontent.com/zerohora00h/TamperMonkeyScripts/main/CadScriptAux.js
// @downloadURL  https://raw.githubusercontent.com/zerohora00h/TamperMonkeyScripts/main/CadScriptAux.js
// ==/UserScript==

const cpfKey = 'cpfEntrevistador';
const observacoesTextoAvKey = 'observacoesTextoAv';
const telKey = 'tel';
const cidadeKey = 'cidade';

const tel = GM_getValue(telKey) || '';
const cidade = GM_getValue(cidadeKey) || '';

const injectHtmlCss = (html, css) => {
  const style = document.createElement('style');
  style.innerHTML = css;
  document.head.appendChild(style);
  document.body.insertAdjacentHTML('beforeend', html);

  // const container = document.createElement('div');
  // container.innerHTML = html;
  // document.body.appendChild(container);
}

// start utils
const setFieldValues = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) {
    element.value = value;
  }
}

const clickRadioButton = (selector, index) => {
  const elements = document.querySelectorAll(selector);
  if (elements.length > index) {
    elements[index].click();
  }
}

const clickCheckBox = (selector, index) => {
  const elements = document.querySelectorAll(selector);
  if (elements.length > index) {
    elements[index].checked = true;
  }
}

const selectOption = (selector, value) => {
  const element = document.querySelector(selector);
  if (element) {
    const options = element.querySelectorAll('option');
    for (const option of options) {
      if (option.value === value) {
        option.selected = true;
        break;
      }
    }
  }
}

const getCurrentDate = () => {
  const data = new Date();
  const day = String(data.getDate()).padStart(2, '0');
  const month = String(data.getMonth() + 1).padStart(2, '0');
  const year = data.getFullYear();
  return { day, month, year };
}

const frmSubmitMod = (action, frmData, checkCad = false) => {
  return new Promise((resolve, reject) => {
    if (!checkCad) loading(true);
    let form = document.getElementById("formularioForm");

    $.ajax({
      type: "POST",
      url: action,
      data: frmData ? frmData : $(form).serialize(),
      success: function (data) {
        if(checkCad) {
          // Cria um documento HTML a partir do texto recebido
          let parser = new DOMParser();
          let doc = parser.parseFromString(data, "text/html");

          // Procura todas as linhas da tabela
          let rows = doc.querySelectorAll('tbody tr');
          let found = false;

          rows.forEach(row => {
            let cells = row.querySelectorAll('td');
            let nameCell = cells[2];  // Célula que contém o nome da pessoa
            let statusCell = cells[6];  // Célula que contém o status

            // Verifica se o status é "CADASTRADO"
            if (statusCell && statusCell.getAttribute('title') === "CADASTRADO") {
              let personName = nameCell.getAttribute('title');
              
              // Exibe um alerta com o nome da pessoa cadastrada
              let userConfirmed = confirm(`${personName} está em um cadastro. Deseja gerenciar esta família?`);
              
              if (userConfirmed) {
                abreLink('recebe_miolo', 'inicializarGerirFamilia.do?acao=iniciarPortletGerirFamilia', 'Gerir Família');
              }
              
              found = true;
            }
          });

          // Se não encontrar ninguém cadastrado, exibe mensagem
          if (!found) {
            alert('NÃO está em um cadastro.');
          }

          resolve();
        } else {
          $("#recebe_miolo").empty().html(data);
          resolve();
        }
      },
      error: function (jqXHR) {
        if(!checkCad){

          $("#recebe_miolo").empty().html(jqXHR.responseText).css("height", "auto");
          $("#breadcrumb").html("> Cadastro &Uacute;nico > Erro Interno");
        }

        reject(new Error("Erro na requisição."));
      },
      complete: function () {
        loading(false);
      },
      dataType: "html"
    });
  });
};

// end utils

const addQuickSearchMenu = () => {

  const htmlToInject = `
  <aside class="tools-menu">
  <div class="options">
    <div class="icon" id="autoAverIconBtn">
      <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" viewBox="0 0 24 24" fill="none">
        <path d="M18.4721 16.7023C17.3398 18.2608 15.6831 19.3584 13.8064 19.7934C11.9297 20.2284 9.95909 19.9716 8.25656 19.0701C6.55404 18.1687 5.23397 16.6832 4.53889 14.8865C3.84381 13.0898 3.82039 11.1027 4.47295 9.29011C5.12551 7.47756 6.41021 5.96135 8.09103 5.02005C9.77184 4.07875 11.7359 3.77558 13.6223 4.16623C15.5087 4.55689 17.1908 5.61514 18.3596 7.14656C19.5283 8.67797 20.1052 10.5797 19.9842 12.5023M19.9842 12.5023L21.4842 11.0023M19.9842 12.5023L18.4842 11.0023" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
    <div class="tooltip hidden">
      <span class="option-name">Auto Atualizar</span>
      <div class="arrow-tooltip"></div>
    </div>
  </div>
  <div class="options">
    <div class="icon"id="preencIconBtn">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="16px" height="16px" version="1.1">
        <defs>

        </defs>
        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
          <g id="Icon-Set" sketch:type="MSLayerGroup" transform="translate(-466.000000, -205.000000)" fill="currentColor">
            <path d="M494,217.014 L480,217.014 C479.447,217.014 479,217.462 479,218.015 C479,218.567 479.447,219 480,219 L494,219.016 C494.553,219.016 495,218.567 495,218.015 C495,217.462 494.553,217.014 494,217.014 L494,217.014 Z M494,211.007 L480,211.007 C479.447,211.007 479,211.455 479,212.008 C479,212.561 479.447,213 480,213 L494,213 C494.553,213 495,212.561 495,212.008 C495,211.455 494.553,211.007 494,211.007 L494,211.007 Z M494,223.021 L486,223.021 C485.447,223.021 485,223.469 485,224.021 C485,224.574 485.447,225 486,225 L494,225 C494.553,225 495,224.574 495,224.021 C495,223.469 494.553,223.021 494,223.021 L494,223.021 Z M494,229.027 L482,229.027 C481.447,229.027 481,229.476 481,230.028 C481,230.581 481.447,231.029 482,231.029 L494,231 C494.553,231 495,230.581 495,230.028 C495,229.476 494.553,229.027 494,229.027 L494,229.027 Z M480,207.002 L494,207 C494.553,207 495,206.554 495,206.001 C495,205.448 494.553,205 494,205 L480,205 C479.447,205 479,205.448 479,206.001 C479,206.554 479.447,207.002 480,207.002 L480,207.002 Z M481.687,223.303 C481.295,222.909 480.659,222.909 480.268,223.303 L475,229.364 L475,205 L473,205 L473,229.4 L467.701,223.303 C467.31,222.909 466.674,222.909 466.282,223.303 C465.89,223.697 465.89,224.335 466.282,224.729 L473.224,232.717 C473.434,232.927 473.711,233.017 473.984,233.002 C474.258,233.017 474.535,232.927 474.745,232.717 L481.687,224.729 C482.079,224.335 482.079,223.697 481.687,223.303 L481.687,223.303 Z" id="Fill-195" sketch:type="MSShapeGroup">

            </path>
          </g>
        </g>
      </svg>
    </div>
    <div class="tooltip hidden">
      <span class="option-name">Preencher</span>
      <div class="arrow-tooltip"></div>
    </div>
  </div>
  <div class="options">
    <div class="icon" id="trabalhoIconBtn">
      <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" viewBox="0 0 16 16">
        <path d="M4 16s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H4Zm4-5.95a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"></path>
        <path d="M2 1a2 2 0 0 0-2 2v9.5A1.5 1.5 0 0 0 1.5 14h.653a5.373 5.373 0 0 1 1.066-2H1V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v9h-2.219c.554.654.89 1.373 1.066 2h.653a1.5 1.5 0 0 0 1.5-1.5V3a2 2 0 0 0-2-2H2Z"></path>
      </svg>
    </div>
    <div class="tooltip hidden">
      Ir para: <span class="option-name">Trabalho</span>
      <div class="arrow-tooltip"></div>
    </div>
  </div>
  <div class="options">
    <div class="icon" id="escolarIconBtn">
      <svg xmlns="http://www.w3.org/2000/svg" width="16px" height="16px" fill="currentColor" viewBox="0 0 16 16">
        <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"></path>
      </svg>
    </div>
    <div class="tooltip hidden">
      Ir para: <span class="option-name">Escolaridade</span>
      <div class="arrow-tooltip"></div>
    </div>
  </div>
  <div class="options showing" id="sBtnCon">
    <div class="icon" id="searchIconBtn">
      <svg viewBox="0 0 20 20" width="16px" height="16px" fill="currentColor">
        <path d="M18.125,15.804l-4.038-4.037c0.675-1.079,1.012-2.308,1.01-3.534C15.089,4.62,12.199,1.75,8.584,1.75C4.815,1.75,1.982,4.726,2,8.286c0.021,3.577,2.908,6.549,6.578,6.549c1.241,0,2.417-0.347,3.44-0.985l4.032,4.026c0.167,0.166,0.43,0.166,0.596,0l1.479-1.478C18.292,16.234,18.292,15.968,18.125,15.804 M8.578,13.99c-3.198,0-5.716-2.593-5.733-5.71c-0.017-3.084,2.438-5.686,5.74-5.686c3.197,0,5.625,2.493,5.64,5.624C14.242,11.548,11.621,13.99,8.578,13.99 M16.349,16.981l-3.637-3.635c0.131-0.11,0.721-0.695,0.876-0.884l3.642,3.639L16.349,16.981z"></path>
      </svg>
    </div>
    <div class="tooltip hidden">
      <span class="option-name">Buscar</span>
      <div class="arrow-tooltip"></div>
    </div>

    <div class="mini-menu-container show" id="popupDiv">
      <div class="mini-menu">
        <div class="radios-container">
          <input type="radio" name="select" id="option-1">
          <label for="option-1" class="option option-1">
            <span>COD</span>
          </label>
          <input type="radio" name="select" id="option-2" checked>
          <label for="option-2" class="option option-2">
            <span>CPF</span>
          </label>
          <input type="radio" name="select" id="option-3">
          <label for="option-3" class="option option-3">
            <span>NIS</span>
          </label>
        </div>

        <input type="text" class="input-mm" placeholder="Número" id="formInputText">

        <button id="searchSubmitAf">
          Buscar (Alterar Familia)
        </button>

        <button id="searchSubmitN">
          Buscar (Normal)
        </button>

        <button id="checkCadSubmit">
          V. Cadastro (Rápido)
        </button>

        <div class="flex">
          <button id="searchSubmitFr">
            F. Resumo
          </button>
          <button id="searchSubmitFp">
            F. Principal
          </button>
        </div>
      </div>
    </div>
  </div>
</aside>
  `
  const cssToInject = `
  .tools-menu {
    --hidden: none;
    --fs: 10px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    position: fixed;
    right: 0;
    top: 30vh;
    z-index: 9999;
    font-size: var(--fs);
  }
  
  .mini-menu-container {
    position: absolute;
    top: -250%;
    right: 120%;
    display: none;
  }
  
  .mini-menu{
    display: flex;
    flex-direction: column;
    background: #374151;
    position: relative;
    padding: 1.5em;
    border-radius: 1rem;
    gap: 1em;
  }
  
  .options {
    --b-r: 0.7rem;
    display: flex;
    gap: 0.5rem;
    margin-left: auto;
    position: relative;
    background: #1890ff;
    color: #fff;
    padding: 0.5rem;
    align-content: center;
    border-radius: var(--b-r) 0 0 var(--b-r);
  }
  
  .options:not(.showing):hover{
    --hidden: inline;
    transform: translateX(-2px);
  }
  
  .showing{
    transform: translateX(-2px);
    background: hsl(209, 100%, 30%);
  }
  
  .tooltip {
    position: absolute;
    background: hsl(217, 19%, 40%);
    color: #fff;
    padding: 0.5rem;
    border-radius: 0.6rem;
    right: 120%;
    white-space: nowrap;
  }
  
  .arrow-container {
    position: relative;
  }
  
  .arrow-tooltip {
    position: absolute;
    top: 35%;
    right: -4px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 5px 0 5px 5px;
    border-color: transparent transparent transparent hsl(217, 19%, 40%);
  }
  
  .option-name {
    font-weight: bold;
  }
  
  .icon {
    width: 20px;
    cursor: pointer;
  }
  
  .hidden {
    display: var(--hidden)
  }
  
  .show {
    display: block;
  }
  
  .mini-menu-container .show:hover{
    transform: none;
  }
  
  .input-mm {
    border-radius: 0.4rem;
    border-style: none;
    padding: 0.5rem;
    font-size: var(--fs);
  }
  
  .flex {
    display: flex;
    align-self: center;
    width: 100%;
    gap: 1em;
  }
  
  .radios-container{
    display: flex;
  }
  
  .tools-menu input[type="radio"]{
    display: none;
  }
  
  .radios-container .option{
    background: #fff;
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin: 0 6px;
    border-radius: 5px;
    cursor: pointer;
    padding: .2rem .5rem;
    border: 2px solid lightgrey;
  }
  
  .tools-menu button {
    background: hsl(211, 100%, 43%);
    flex-grow: 1;
    color: #fff;
    border-radius: .4rem;
    cursor: pointer;
    padding: 0.5rem;
    border: none;
    font-size: var(--fs);
  }
  
  .tools-menu button:hover{
    background: hsl(211, 100%, 43%, 0.5);
  }
  
  #option-1:checked:checked ~ .option-1,
  #option-2:checked:checked ~ .option-2,
  #option-3:checked:checked ~ .option-3{
    border-color: #0069d9;
    background: #0069d9;
  }
  
  .radios-container .option span{
    color: #808080;
  }
  
  #option-1:checked:checked ~ .option-1 span,
  #option-2:checked:checked ~ .option-2 span,
  #option-3:checked:checked ~ .option-3 span{
    color: #fff;
  }
  `

  const { PDFDocument, rgb, StandardFonts } = PDFLib
  async function downloadFrEdit(url) {
    const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())

    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const pages = pdfDoc.getPages()
    const firstPage = pages[0]

    const { width, height } = firstPage.getSize()
    let dataHj = new Date().toLocaleDateString('pt-br')

    let quantPessoasCad = document.querySelectorAll('td[title="CADASTRADO"]').length + document.querySelectorAll('td[title="EM CADASTRAMENTO"]').length + document.querySelectorAll('td[title="ATRIBUINDO NIS"]').length

    firstPage.drawText(cidade + '   ' + dataHj, {
      x: 230,
      y: 500 - (54 * quantPessoasCad),
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0)
    })

    const nomeDoRF = document.querySelector('td[title="RESPONSAVEL FAMILIAR"]').closest('tr').querySelector('td.textLeft').innerText.replace((/  |\r\n|\t|\n|\r/gm), "").split('- ')[1]

    const pdfDataUri = await pdfDoc.saveAsBase64()

    //download pdf
    const linkSource = `data:application/pdf;base64,${pdfDataUri}`;
    const downloadLink = document.createElement("a");
    const fileName = nomeDoRF + ' - Folha Resumo.pdf';
    downloadLink.href = linkSource;
    downloadLink.download = fileName;
    downloadLink.click();

  }

  injectHtmlCss(htmlToInject, cssToInject);

  function formatForm(num, option) {
    num = num.replace(/[^\d]/g, ''); // remove all non-numeric characters

    const code1 = num.slice(0, -2).padStart(9, '0');
    const code2 = num.slice(-2);

    const result = {
      url: '',
      data: ''
    };

    switch (option) {
      case '1':
        result.url = 'buscaFamiliaCodigoFamilia.do?acao=consultarCodigoFamilia';
        result.data = `acao=iniciarBuscaFamilia&tipoBusca=${option}&codigoFamiliaComDv=${num}&codigoPessoaNis=&numeroCPF=&codigoFamilia=${code1}&dvFamilia=${code2}&nome=&diaNascimento=&mesNascimento=&anoNascimento=&nomeMae=&nomePai=&tipoCertidao=&certidao=&ufCertidao=&numeroRG=&numeroTitulo=&numeroCTPS=`;
        break;
      case '2':
        result.url = 'buscaFamiliaCpfPessoa.do?acao=consultarCpfPessoa';
        result.data = `acao=iniciarBuscaFamilia&tipoBusca=${option}&codigoFamiliaComDv=&codigoPessoaNis=&numeroCPF=${num}&codigoFamilia=&dvFamilia=&nome=&diaNascimento=&mesNascimento=&anoNascimento=&nomeMae=&nomePai=&tipoCertidao=&certidao=&ufCertidao=&numeroRG=&numeroTitulo=&numeroCTPS=`;
        break;
      case '3':
        result.url = 'buscaFamiliaNisPessoa.do?acao=consultarNisPessoa';
        result.data = `acao=iniciarBuscaFamilia&tipoBusca=${option}&codigoFamiliaComDv=&codigoPessoaNis=${num}&numeroCPF=&codigoFamilia=&dvFamilia=&nome=&diaNascimento=&mesNascimento=&anoNascimento=&nomeMae=&nomePai=&tipoCertidao=&certidao=&ufCertidao=&numeroRG=&numeroTitulo=&numeroCTPS=`;
        break;
    }

    return result;
  }

  // Icon search button to show or hide
  document.getElementById('searchIconBtn')
    .addEventListener('click', () => {
      document.getElementById('popupDiv').classList.toggle('show')
      document.getElementById('sBtnCon').classList.toggle('showing')
    })

  //simulating form submit
  document.getElementById("formInputText").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      document.getElementById("searchSubmitAf").click();
    }
  });

  const findPerson = async (mode = 1) => {
    // modes: 1 = alterar familia, 2 = normal, 3 = folha resumo, 4 = formulario principal, 5 = verificar se tem cadastro

    document.getElementById('popupDiv').classList.toggle('show')
    document.getElementById('sBtnCon').classList.toggle('showing')
    if (mode !== 5) loading(true) //native function in page

    const selectedOption = document.querySelector('input[name="select"]:checked').id.split('-')[1]
    // options: 1 = cod familiar, 2 = cpf, 3 = nis

    const inputText = document.querySelector('#formInputText').value

    const cadunOpenCad = (codFam, digitoVerificador, formId) => {
      return new Promise((resolve, reject) => {
        loading(true);
        let form = document.getElementById(formId);
        form.codigoFamilia.value = codFam;
        form.dvFamilia.value = digitoVerificador;
        $.ajax({
          type: "POST",
          url: form.action,
          data: $(form).serialize(),
          success: (data) => {
            $("#recebe_miolo").empty().html(data);
          },
          error: () => {
            reject(new Error('Erro na requisição.'));
          },
          complete: () => {
            loading(false);
            resolve();
          }, dataType: "html"
        });
      });
    };

    const { url, data } = formatForm(inputText, selectedOption)

    if (mode === 5) { //está acima para cancelar o restante

      await frmSubmitMod(url, data, true)

      return
    }

    await frmSubmitMod(url, data)

    if (selectedOption === '1' && mode === 1) {
      cadunAlterarFamilia()
      return
    }

    let validCad = document.querySelector('td[title="CADASTRADO"]').closest('tr').attributes[1]
    let infoFoundCad = validCad.value.split("'")
    let codFam = infoFoundCad[1];
    let digitoVerificador = infoFoundCad[3];
    validCad.value = ""

    if (!validCad) return

    if (mode === 1) {
      await cadunOpenCad(codFam, digitoVerificador, 'buscaFamiliaForm')
        .then(() => {
          cadunAlterarFamilia()
        }).catch((err) => {
          console.log(err)
        })

      return
    }

    if (mode === 2) {
      await cadunOpenCad(codFam, digitoVerificador, 'buscaFamiliaForm')
        .catch((err) => {
          console.log(err)
        })

      return
    }

    if (mode === 3) {
      await cadunOpenCad(codFam, digitoVerificador, 'buscaFamiliaForm')
        .then(() => {
          downloadFrEdit('/cadun/ImprimirFolhaResumoServlet')
        }).catch((err) => {
          console.log(err)
        })

      return
    }

    if (mode === 4) {
      await cadunOpenCad(codFam, digitoVerificador, 'buscaFamiliaForm')
        .then(() => {
          const downloadLink = document.createElement('a');
          const fileName = 'Form Principal.pdf';
          downloadLink.href = '/cadun/ImprimirFormularioPrincipalServlet';
          downloadLink.download = fileName;
          downloadLink.click();
        })
        .catch((err) => {
          console.log(err)
        })
    }
  }

  document.getElementById('searchSubmitAf').addEventListener('click', async () => {
    await findPerson(1)
  })

  document.getElementById('searchSubmitN').addEventListener('click', async () => {
    await findPerson(2)
  })

  document.getElementById('searchSubmitFr').addEventListener('click', async () => {
    await findPerson(3)
  })

  document.getElementById('searchSubmitFp').addEventListener('click', async () => {
    await findPerson(4)
  })

  document.getElementById('checkCadSubmit').addEventListener('click', async () => {
    await findPerson(5)
  })

}

const addEscolaridadeShortcut = () => {

  const initEscCadCrawler = async () => {
    cadunSelecionaPessoa(''); //native function in page
    // if (addPessoa != null) setAdicionarPessoa('', addPessoa); //native function in page
    setConsultarPessoa('', false); //native function in page

    await frmSubmitMod('carregarTelasPessoa.do?acao=confirmarSelecionarOutraPessoaParaEdicao&metodo=alterar')

    if (document.body.contains(document.getElementById('L_aviso'))) {
      document.getElementById("codigoMembroFamiliarTemp").value = document.getElementById("codigoMembroFamiliarAux").value;
      document.getElementById("codigoMembroFamiliar").value = document.getElementById("codigoMembroFamiliarAux").value;
      await frmSubmitMod("carregarTelasPessoa.do?acao=iniciarAlterar&continuarAtualizacaoPessoa=true")
    }

    await frmSubmitMod('iniciarAlterarEscolaridade.do?acao=iniciarAlterar')
  }

  document.getElementById('escolarIconBtn')
    .addEventListener('click', initEscCadCrawler)
}

const addTrabalhoShortcut = () => {

  const initTrabCadCrawler = async (url) => {
    cadunSelecionaPessoa(''); //native function in page
    // if (addPessoa != null) setAdicionarPessoa('', addPessoa); //native function in page
    setConsultarPessoa('', false); //native function in page

    await frmSubmitMod('carregarTelasPessoa.do?acao=confirmarSelecionarOutraPessoaParaEdicao&metodo=alterar')

    if (document.body.contains(document.getElementById('L_aviso'))) {
      document.getElementById('codigoMembroFamiliarTemp').value = document.getElementById('codigoMembroFamiliarAux').value;
      document.getElementById('codigoMembroFamiliar').value = document.getElementById('codigoMembroFamiliarAux').value;
      await frmSubmitMod('carregarTelasPessoa.do?acao=iniciarAlterar&continuarAtualizacaoPessoa=true')
    }

    await frmSubmitMod('iniciarAlterarTrabalhoRemuneracao.do?acao=iniciarAlterar')
  }

  document.getElementById('trabalhoIconBtn')
    .addEventListener('click', initTrabCadCrawler)
}

const addDefaultDataFill = () => {

  const runFunc = () => {
    const codCurrentPage = document.querySelector("#formularioForm").codigoTelaAtual.value;

    switch (codCurrentPage) {
      case "1":
        clickRadioButton('input[name="formaColeta"]', 0);
        const { day, month, year } = getCurrentDate();
        setFieldValues('input[name="diaEntrevista"]', day);
        setFieldValues('input[name="mesEntrevista"]', month);
        setFieldValues('input[name="anoEntrevista"]', year);
        setFieldValues('textarea[name="observacoes"]', "ATUALIZACAO CADASTRAL");
        break;
      case "3":
        clickRadioButton('input[name="familiaIndigena"]', 1);
        clickRadioButton('input[name="familiaQuilambola"]', 1);
        clickCheckBox('input[name="naoTemCriancaAdolecenteDoente"]', 0);
        clickCheckBox('input[name="naoTemJovemAdultoDoente"]', 0);
        clickCheckBox('input[name="naoTemIdosoDoente"]', 0);
        break;
      case "6":
        clickRadioButton('input[name="possuiDeficiencia"]', 1);
        break;
      case "7":
        // Obtenha os valores dos selects
        let frequentaEscola = document.querySelector('select[name="frequentaEscola"]').value;
        let tipoCursoFrequenta = document.querySelector('select[name="tipoCursoFrequenta"]').value;
        let anoSerieCursoFrequenta = document.querySelector('select[name="anoSerieCursoFrequenta"]').value;

        //se já está estudando
        if (frequentaEscola === '1') {
          // Se a serie for maior que a quarta
          if (['3', '4', '5'].includes(tipoCursoFrequenta) && parseInt(anoSerieCursoFrequenta) > 4) {
            clickRadioButton('input[name="sabeLerEscrever"]', 0);
          } else if (['7', '8', '11'].includes(tipoCursoFrequenta)) { // Se tiver no ensino médio
            clickRadioButton('input[name="sabeLerEscrever"]', 0);
          } else {
            clickRadioButton('input[name="sabeLerEscrever"]', 1);
          }
        } else if (frequentaEscola === '') {
          // Se frequentaEscola ainda nao tiver sido definido (provavel inclusão)
          setFieldValues('select[name="frequentaEscola"]', 4);
          clickRadioButton('input[name="sabeLerEscrever"]', 1);
        } else {
          // clique opção padrão
          clickRadioButton('input[name="sabeLerEscrever"]', 1);
        }
        break;
      case "8":
        clickRadioButton('input[name="trabalhouSemanaPassada"]', 1);
        clickRadioButton('input[name="afastadoSemanaPassada"]', 1);
        clickCheckBox('input[name="checkRemuneracaoMes"]', 0);
        document.querySelectorAll('input[name="trabalhouSemanaPassada"]')[1].disabled ? '' : document.querySelectorAll('input[name="trabalhoRemuneradoUltimoAno"]')[1].disabled = false;
        clickRadioButton('input[name="trabalhoRemuneradoUltimoAno"]', 1);
        clickCheckBox('input[name="checkAjudaDoacao"]', 0);
        clickCheckBox('input[name="checkAposentadoria"]', 0);
        clickCheckBox('input[name="checkSeguroDesemprego"]', 0);
        clickCheckBox('input[name="checkPensaoAlimenticia"]', 0);
        clickCheckBox('input[name="checkOutrasFontes"]', 0);
        break;
      case "9":
        selectOption('select#tipoTelefone1', 'N');
        selectOption('select#tipoTelefone2', 'N');
        selectOption('select#tipoEmail', 'N');
        break;
      case "10":
        clickRadioButton('input[name="existeTrabalhoInfantil"]', 1);
        break;
      case "11":
        clickCheckBox('input[name="programaBeneficioSesanItensSelecionados"]', 13);
        clickCheckBox('input[name="programaBeneficioPlanoNacionalDeErradicacaoDoTrabalhoEscravo"]', 1);
        clickCheckBox('input[name="programaBeneficioMinisterioDeMinasEEnergia"]', 3);
        clickCheckBox('input[name="programaBeneficioSnasItensSelecionados"]', 23);
        clickRadioButton('input[name="beneficioPessoaRadioButton"]', 0);
        selectOption('select#outrasParceriasMDS', '0');
        break;
    }
  }

  document.onkeyup = function (e) {
    if (e.ctrlKey && e.code == "Space") {
      runFunc();
    }
  };

  document.getElementById('preencIconBtn')
    .addEventListener('click', () => {
      runFunc();
    })
}

const addAutoAver = () => {

  const initAutoUpdateCrawler = async () => {
    if (document.querySelector("#formularioForm").codigoTelaAtual.value != "1") return //verify if is in the correct page

    const { day, month, year } = getCurrentDate();
    clickRadioButton('input[name="formaColeta"]', 1)

    setFieldValues('input[name="diaEntrevista"]', day);
    setFieldValues('input[name="mesEntrevista"]', month);
    setFieldValues('input[name="anoEntrevista"]', year);

    let nomeRuaOriginal = document.querySelector('input[name="nomeLogradouro"]').value

    setFieldValues('input[name="nomeLogradouro"]', "SEM NOME");
    setFieldValues('input[name="cpfEntrevistador"]', GM_getValue(cpfKey));
    setFieldValues('textarea[name="observacoes"]', GM_getValue(observacoesTextoAvKey));

    function cadunObterEntrevistadorMod() {
      if (GM_getValue(cpfKey).cadunTrim() == "") {
        $("#nomeEntrevistador").empty().html("CPF n&atilde;o informado.");
        return;
      }
      loading(true);

      return new Promise((resolve, reject) => {
        $.ajax({
          type: "GET"
          , url: 'AjaxRequestsServlet?acao=buscarEntrevistador&nameSpace=&cpf=' + GM_getValue(cpfKey)
          , success: function (data) {
            resolve();
            try {
              $("#nomeEntrevistador").empty().html(data);
            } catch (Exception) {
              $("#recebe_miolo").empty().html(jqXHR.responseText).css("height", "auto"); $("#breadcrumb").html("> Cadastro &Uacute;nico > Erro Interno");
            }
          }
          , error: function (jqXHR) { $("#recebe_miolo").empty().html(jqXHR.responseText).css("height", "auto"); $("#breadcrumb").html("> Cadastro &Uacute;nico > Erro Interno"); reject(); }
          , complete: function () { loading(false); }
          , dataType: "html"
        });
      });
    }

    const performUpdates = async () => {
      try {
        await cadunObterEntrevistadorMod();
        await frmSubmitMod('finalizarAtualizacoes.do?acao=finalizarAtualizacoes');

        setFieldValues('input[name="nomeLogradouro"]', nomeRuaOriginal);

        await frmSubmitMod('finalizarAtualizacoes.do?acao=finalizarAtualizacoes');

        const form = document.querySelector("#formularioForm");
        if (form.codigoTelaAtual.value === '5') {
          const checkNascimento = document.getElementById("nascimento");
          if (checkNascimento && checkNascimento.checked) {
            checkNascimento.disabled = false;
          }
        }

        if (form.codigoTelaAtual.value === "3") {
          const cadastrados = document.querySelectorAll("td[title='CADASTRADO']");
          if (cadastrados.length > 0) {
            setFieldValues('input[name="qtdPessoasDomicilio"]', cadastrados.length);
            setFieldValues('input[name="qtdFamiliasDomicilio"]', "1");

            await frmSubmitMod('finalizarAtualizacoes.do?acao=finalizarAtualizacoes');
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    await performUpdates();
  }

  document.getElementById('autoAverIconBtn').addEventListener('click', initAutoUpdateCrawler)
}

function config() {
  const htmlToInject = `
  <div class="config-btn" id="configBtn">
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="20px" height="20px" viewBox="0 0 32 32" version="1.1">
<g id="icomoon-ignore">
</g>
<path d="M17.599 3.738v2.598l0.8 0.207c0.905 0.234 1.768 0.597 2.566 1.081l0.715 0.434 1.86-1.86 2.262 2.262-1.888 1.888 0.407 0.708c0.451 0.785 0.788 1.635 1.002 2.527l0.196 0.817h2.744v3.199h-2.806l-0.216 0.782c-0.233 0.844-0.583 1.654-1.040 2.406l-0.434 0.716 2.036 2.035-2.262 2.262-2.064-2.064-0.707 0.407c-0.734 0.422-1.531 0.745-2.368 0.961l-0.8 0.206v2.951h-3.199v-2.951l-0.8-0.206c-0.837-0.216-1.634-0.539-2.368-0.961l-0.708-0.407-2.064 2.064-2.262-2.262 2.036-2.035-0.434-0.716c-0.457-0.753-0.807-1.562-1.040-2.406l-0.216-0.782h-2.806v-3.199h2.744l0.196-0.817c0.213-0.891 0.551-1.742 1.002-2.527l0.407-0.708-1.888-1.888 2.262-2.262 1.86 1.86 0.715-0.434c0.798-0.484 1.661-0.848 2.566-1.081l0.8-0.207v-2.598h3.199zM16 20.799c2.646 0 4.798-2.153 4.798-4.799s-2.152-4.799-4.798-4.799-4.798 2.153-4.798 4.799c0 2.646 2.152 4.799 4.798 4.799zM18.666 2.672h-5.331v2.839c-1.018 0.263-1.975 0.67-2.852 1.202l-2.022-2.022-3.769 3.77 2.065 2.065c-0.498 0.867-0.875 1.81-1.114 2.809h-2.97v5.331h3.060c0.263 0.953 0.655 1.85 1.156 2.676l-2.198 2.198 3.769 3.77 2.241-2.241c0.816 0.469 1.7 0.828 2.633 1.069v3.191h5.331v-3.191c0.933-0.241 1.817-0.6 2.633-1.069l2.241 2.241 3.769-3.77-2.198-2.198c0.501-0.826 0.893-1.723 1.156-2.676h3.060v-5.331h-2.97c-0.239-0.999-0.616-1.941-1.114-2.809l2.065-2.065-3.769-3.77-2.022 2.022c-0.877-0.532-1.834-0.939-2.852-1.202v-2.839h-0zM16 19.733c-2.062 0-3.732-1.671-3.732-3.733s1.67-3.732 3.732-3.732 3.732 1.671 3.732 3.732c0 2.062-1.67 3.733-3.732 3.733v0z" fill="currentColor">

</path>
</svg>
</div>

<div class="config-form" id="configForm">
  <span>Configurar</span>
  <label for="cpf">CPF Entrevistador</label>
  <input type="text" for="cpf" placeholder="Não configurado" id="cpfFormInput">
  
  <label for="obs">Observações</label>
  <input type="text" for="obs" placeholder="Não configurado" id="obsFormInput">
  
  <label for="tel">Telefone</label>
  <input type="text" for="tel" placeholder="Não configurado" id="telFormInput">
  
  <label for="cidade">Cidade</label>
  <input type="text" for="cidade" placeholder="Não configurado" id="cidadeFormInput">
  
  <button id="confirmConfigBtn">Confirmar</button>
</div>
  `
  const cssToInject = `
  .config-btn {
    position: fixed;
    display: flex;
    flex-direction: column;
    top: 50%;
    left: 10px;
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 0.5rem;
    border-radius: 10px;
    color: #fff;
    font-weight: bold;
    cursor: pointer;
}

.config-form{
    position: fixed;
    display: none;
    flex-direction: column;
    gap: 0.3rem;
    top: 50%;
    left: 15%;
    transform: translate(-50%, -50%);
    z-index: 9999;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 1rem;
    border-radius: 10px;
    color: #fff;
    font-size: 10px;
}

.config-form span {
  align-self: center;
  font-size: 12px;
  font-weight: bold;
}

.show-config{
  display: flex;
}
  `
  injectHtmlCss(htmlToInject, cssToInject);

  document.getElementById("configBtn").addEventListener("click", () => {
    document.getElementById("configForm").classList.toggle("show-config");
  });

  const savedCpf = GM_getValue('cpfEntrevistador', '');
  const savedObservacoes = GM_getValue('observacoesTextoAv', '');
  const savedTel = GM_getValue('tel', '');
  const savedCidade = GM_getValue('cidade', '');

  // Campos do formulário
  const cpfInput = document.querySelector('#cpfFormInput');
  cpfInput.value = savedCpf;

  const observacoesInput = document.querySelector('#obsFormInput');
  observacoesInput.value = savedObservacoes;

  const telInput = document.querySelector('#telFormInput');
  telInput.value = savedTel;

  const cidadeInput = document.querySelector('#cidadeFormInput');
  cidadeInput.value = savedCidade;

  const confirmButton = document.querySelector('#confirmConfigBtn');

  confirmButton.addEventListener('click', () => {
    GM_setValue('cpfEntrevistador', cpfInput.value);
    GM_setValue('observacoesTextoAv', observacoesInput.value);
    GM_setValue('tel', telInput.value);
    GM_setValue('cidade', cidadeInput.value);

    document.getElementById("configForm").classList.toggle("show-config");
  });
}

function RunMods() {
  'use strict'
  if (!document.body.contains(document.querySelector('div#geralDadosUsuario'))) return

  config();

  addQuickSearchMenu();
  addEscolaridadeShortcut();
  addTrabalhoShortcut();
  addDefaultDataFill();
  addAutoAver();

  let intervalId = null;

  function adicionarNovoElemento() {
    let el = document.querySelector('a[title="Emissão Comprovante Cadastro"]');
    if (el === null) return;
    if (el.onclick) {
      el.setAttribute('onclick', "window.open('/cadun/ComprovanteCadastroServlet?telefoneOrgaoResponsavel=" + tel + "', '_self')");
    }

    const novoLi = document.createElement('li');
    novoLi.innerHTML = '- <a title="Histórico Família (Rápido)" id="historicoRapido">Histórico da Família (Rápido)</a>';

    const exibeHistoricoLink = document.querySelector('a[title="Histórico Família"]');
    exibeHistoricoLink.parentElement.appendChild(novoLi);

    const historicoRapido = () => {
      const codFam = document.querySelector('input[name="codigoFamilia"]').value;
      let { day, month, year } = getCurrentDate();
      window.open(`https://cadastrounico.caixa.gov.br/cadun/AjaxRequestsServlet?acao=buscarOperacaoHistoricoFamilia&codigoFamiliar=${codFam}&dia_data_inicio=01&mes_data_inicio=01&ano_data_inicio=2021&dia_data_fim=${day}&mes_data_fim=${month}&ano_data_fim=${year}&camposHistoricoSelecionados=249,965,386,140,18,47,215,229,309,218,247,9,10,236,311,33,30,211,243,25,150,129,314,315,154,153,84,77,89,127,201,145,107,133,401,166,402,135,403,332,320,317,324,323,357,351,358,353,370,354,359,383,2,208,253,955,954,304,953,958,957,503,956,961,960,959,978,979,980,981,982,137,966,518,295,524,526,525,551,554,962,109,431,432,37,39,433,57,130,434,43,438,501,384,28,330,331,364,967,106`, '_blank');
    };

    novoLi.addEventListener('click', historicoRapido);
  }

  // Se o elemento com ID "historicoRapido" não existir, reativa o intervalo

  intervalId = setInterval(() => {
    if (!document.getElementById("historicoRapido")) {
      adicionarNovoElemento();
    }
  }, 200);


  adicionarNovoElemento();

  function imprimirFieldsetform() {
    const content = document.querySelector('fieldset').innerHTML;
    const headContent = document.head.innerHTML;
  
    // Cria um iframe oculto
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
  
    // Adiciona o conteúdo ao iframe e aplica o estilo para espaçamento
    iframe.contentDocument.write(`
      <html>
        <head>${headContent}</head>
        <style>
          ul {
            display: flex;
            flex-direction: column;
            gap: 10px; /* Define o gap entre os elementos */
            color: black;
          }
        </style>
        <body>
          <ul>${content}</ul>
        </body>
      </html>
    `);
    iframe.contentDocument.close();
  
    // Adiciona um pequeno atraso antes de imprimir
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
  
      // Remove o iframe após a impressão
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 4000);
    }, 100); // Atraso de 100ms
  }

  function monitorAjaxAndHandleForm() {
    let open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      if (url.includes('AjaxRequestsServlet?acao=listaAnoSerieCursoFrequenta')) {
        this.addEventListener('load', function () {
          // A requisição AJAX foi concluída
          console.log('Requisição AJAX concluída:', url);
  
          // Adiciona um pequeno delay antes de continuar
          setTimeout(function () {
            let tipoCursoFrequenta = document.querySelector('select[name="tipoCursoFrequenta"]').value;
            let anoSerieCursoFrequentaSelect = document.querySelector('select[name="anoSerieCursoFrequenta"]');
  
            if (anoSerieCursoFrequentaSelect) {
              // Adiciona o evento onchange
              anoSerieCursoFrequentaSelect.addEventListener('change', function () {
                let anoSerieCursoFrequenta = parseInt(this.value, 10);
                let frequentaEscola = document.querySelector('select[name="frequentaEscola"]').value;
  
                if (!['3', '4', '5'].includes(tipoCursoFrequenta)) return; //se não tiver no ensino fundamental, retorna
  
                if (anoSerieCursoFrequenta > 4) {
                  clickRadioButton('input[name="sabeLerEscrever"]', 0);
                } else if (frequentaEscola !== 3) {
                  clickRadioButton('input[name="sabeLerEscrever"]', 1);
                }
              });
  
              let frequentaEscola = document.querySelector('select[name="frequentaEscola"]').value;

              if (['7', '8', '11'].includes(tipoCursoFrequenta)) { // Se tiver no ensino médio
                clickRadioButton('input[name="sabeLerEscrever"]', 0);
              } else if (frequentaEscola !== 3) {
                clickRadioButton('input[name="sabeLerEscrever"]', 1);
              }
            } else {
              console.log('Select anoSerieCursoFrequenta não encontrado.');
            }
          }, 1000); // Delay de 1 segundo
        });
      }
  
      // Verifica se a URL corresponde a uma das que queremos monitorar

      if (url.includes('visualizarFormularioIdentificacaoPessoa.do') || 
      url.includes('visualizarFormularioDocumentos.do') || 
      url.includes('visualizarFormularioEscolaridade.do') || 
      url.includes('visualizarFormularioTrabalhoRemuneracao.do') ||
      url.includes('carregarTelasPessoa.do') ||
      url.includes('iniciarAlterarIdentificacaoPessoa.do') ||
      url.includes('iniciarAlterarDocumentos.do') ||
      url.includes('iniciarAlterarEscolaridade.do') ||
      url.includes('iniciarAlterarTrabalhoRemuneracao.do')) {

        this.addEventListener('load', function () {
          // Adiciona um delay de 2 segundos antes de executar a lógica
          setTimeout(function () {
            // Verifica se o elemento <h3 class="tituloFormulario"> existe
            let tituloFormulario = document.querySelector('h3.tituloFormulario');
            if (tituloFormulario) {
              // Cria o elemento <a> com o SVG
              let link = document.createElement('a');
              link.href = '#'; // Define o link como "#"
  
              // Adiciona o SVG ao link
              link.innerHTML = `
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 122.88 114.13" style="enable-background:new 0 0 122.88 114.13; width: 20px; height: 20px; vertical-align: middle;" xml:space="preserve">
                  <g>
                    <path d="M23.2,29.44V3.35V0.53C23.2,0.24,23.44,0,23.73,0h2.82h54.99c0.09,0,0.17,0.02,0.24,0.06l1.93,0.8l-0.2,0.49l0.2-0.49 c0.08,0.03,0.14,0.08,0.2,0.14l12.93,12.76l0.84,0.83l-0.37,0.38l0.37-0.38c0.1,0.1,0.16,0.24,0.16,0.38v1.18v13.31 c0,0.29-0.24,0.53-0.53,0.53h-5.61c-0.29,0-0.53-0.24-0.53-0.53v-6.88H79.12H76.3c-0.29,0-0.53-0.24-0.53-0.53 c0-0.02,0-0.03,0-0.05v-2.77h0V6.69H29.89v22.75c0,0.29-0.24,0.53-0.53,0.53h-5.64C23.44,29.97,23.2,29.73,23.2,29.44L23.2,29.44z M30.96,67.85h60.97h0c0.04,0,0.08,0,0.12,0.01c0.83,0.02,1.63,0.19,2.36,0.49c0.79,0.33,1.51,0.81,2.11,1.41 c0.59,0.59,1.07,1.31,1.4,2.1c0.3,0.73,0.47,1.52,0.49,2.35c0.01,0.04,0.01,0.08,0.01,0.12v0v9.24h13.16h0c0.04,0,0.07,0,0.11,0.01 c0.57-0.01,1.13-0.14,1.64-0.35c0.57-0.24,1.08-0.59,1.51-1.02c0.43-0.43,0.78-0.94,1.02-1.51c0.21-0.51,0.34-1.07,0.35-1.65 c-0.01-0.03-0.01-0.07-0.01-0.1v0V43.55v0c0-0.04,0-0.07,0.01-0.11c-0.01-0.57-0.14-1.13-0.35-1.64c-0.24-0.56-0.59-1.08-1.02-1.51 c-0.43-0.43-0.94-0.78-1.51-1.02c-0.51-0.22-1.07-0.34-1.65-0.35c-0.03,0.01-0.07,0.01-0.1,0.01h0H11.31h0 c-0.04,0-0.08,0-0.11-0.01c-0.57,0.01-1.13,0.14-1.64,0.35C9,39.51,8.48,39.86,8.05,40.29c-0.43,0.43-0.78,0.94-1.02,1.51 c-0.21,0.51-0.34,1.07-0.35,1.65c0.01,0.03,0.01,0.07,0.01,0.1v0v35.41v0c0,0.04,0,0.08-0.01,0.11c0.01,0.57,0.14,1.13,0.35,1.64 c0.24,0.57,0.59,1.08,1.02,1.51C8.48,82.65,9,83,9.56,83.24c0.51,0.22,1.07,0.34,1.65,0.35c0.03-0.01,0.07-0.01,0.1-0.01h0h13.16 v-9.24v0c0-0.04,0-0.08,0.01-0.12c0.02-0.83,0.19-1.63,0.49-2.35c0.31-0.76,0.77-1.45,1.33-2.03c0.02-0.03,0.04-0.06,0.07-0.08 c0.59-0.59,1.31-1.07,2.1-1.4c0.73-0.3,1.52-0.47,2.36-0.49C30.87,67.85,30.91,67.85,30.96,67.85L30.96,67.85L30.96,67.85z M98.41,90.27v17.37v0c0,0.04,0,0.08-0.01,0.12c-0.02,0.83-0.19,1.63-0.49,2.36c-0.33,0.79-0.81,1.51-1.41,2.11 c-0.59,0.59-1.31,1.07-2.1,1.4c-0.73,0.3-1.52,0.47-2.35,0.49c-0.04,0.01-0.08,0.01-0.12,0.01h0H30.96h0 c-0.04,0-0.08-0.01-0.12-0.01c-0.83-0.02-1.62-0.19-2.35-0.49c-0.79-0.33-1.5-0.81-2.1-1.4c-0.6-0.6-1.08-1.31-1.41-2.11 c-0.3-0.73-0.47-1.52-0.49-2.35c-0.01-0.04-0.01-0.08-0.01-0.12v0V90.27H11.31h0c-0.04,0-0.08,0-0.12-0.01 c-1.49-0.02-2.91-0.32-4.2-0.85c-1.39-0.57-2.63-1.41-3.67-2.45c-1.04-1.04-1.88-2.28-2.45-3.67c-0.54-1.3-0.84-2.71-0.85-4.2 C0,79.04,0,79,0,78.96v0V43.55v0c0-0.04,0-0.08,0.01-0.12c0.02-1.49,0.32-2.9,0.85-4.2c0.57-1.39,1.41-2.63,2.45-3.67 c1.04-1.04,2.28-1.88,3.67-2.45c1.3-0.54,2.71-0.84,4.2-0.85c0.04-0.01,0.08-0.01,0.12-0.01h0h100.25h0c0.04,0,0.08,0,0.12,0.01 c1.49,0.02,2.91,0.32,4.2,0.85c1.39,0.57,2.63,1.41,3.67,2.45c1.04,1.04,1.88,2.28,2.45,3.67c0.54,1.3,0.84,2.71,0.85,4.2 c0.01,0.04,0.01,0.08,0.01,0.12v0v35.41v0c0,0.04,0,0.08-0.01,0.12c-0.02,1.49-0.32,2.9-0.85,4.2c-0.57,1.39-1.41,2.63-2.45,3.67 c-1.04,1.04-2.28,1.88-3.67,2.45c-1.3,0.54-2.71,0.84-4.2,0.85c-0.04,0.01-0.08,0.01-0.12,0.01h0H98.41L98.41,90.27z M89.47,15.86 l-7-6.91v6.91H89.47L89.47,15.86z M91.72,74.54H31.16v32.89h60.56V74.54L91.72,74.54z" fill="#ffffff"/>
                  </g>
                </svg>
              `;
              link.style.marginLeft = '10px'; // Adiciona um espaço à esquerda para melhor visualização

              link.addEventListener('click', function(event) {
                event.preventDefault(); // Previne o comportamento padrão do link
                imprimirFieldsetform(); // Chama a função de impressão
              });
  
              // Anexa o link ao final do conteúdo do <h3>
              tituloFormulario.appendChild(link);
            }
          }, 1000); // Delay de 1 segundo
        });
      }
  
      open.apply(this, arguments);
    };
  }
  

  monitorAjaxAndHandleForm()
}

RunMods()
