// ==UserScript==
// @name         FERRAMENTAS ADICIONAIS
// @version      1.05
// @description  FERRAMENTAS ADICIONAIS PARA O SISTEMA
// @author       ZeroHora
// @match        https://cadastrounico.caixa.gov.br/cadun/*
// @match        https://www.cadastrounico.caixa.gov.br/cadun/*
// @require      https://unpkg.com/pdf-lib/dist/pdf-lib.js
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @updateURL    https://raw.githubusercontent.com/zerohora00h/TamperMonkeyScripts/main/CadScriptAux.js
// @downloadURL  https://raw.githubusercontent.com/zerohora00h/TamperMonkeyScripts/main/CadScriptAux.js
// ==/UserScript==

const cpfEntrevistador = '000.000.000-00' //CPF
const observacoesTextoAv = 'OBSERVACOES' //OBSERVAÇÕES
const tel = '00000000000' //TELEFONE
const cidade = 'CIDADE - ESTADO' //CIDADE

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

const getCurrentDate = () => {
  const data = new Date();
  const day = String(data.getDate()).padStart(2, '0');
  const month = String(data.getMonth() + 1).padStart(2, '0');
  const year = data.getFullYear();
  return { day, month, year };
}
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
      <span class="option-name">Auto Averiguar</span>
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
  <div class="options">
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
  
  .options:hover{
    --hidden: inline;
    transform: translateX(-2px)
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
    .addEventListener('click', () => { document.getElementById('popupDiv').classList.toggle('show') })

  const findPerson = async (mode = 1) => {
    // modes: 1 = alterar familia, 2 = normal, 3 = folha resumo, 4 = formulario principal

    document.getElementById('popupDiv').classList.toggle('show')
    loading(true) //native function in page

    const selectedOption = document.querySelector('input[name="select"]:checked').id.split('-')[1]
    // options: 1 = cod familiar, 2 = cpf, 3 = nis

    const inputText = document.querySelector('#formInputText').value

    const { url, data } = formatForm(inputText, selectedOption)

    const fetchData = (url, data) => {
      return new Promise((resolve, reject) => {
        $.ajax({
          type: 'POST',
          url: url,
          data: data,
          success: function (data) {
            $('#recebe_miolo').empty().html(data);
            resolve();
          },
          error: function (jqXHR) {
            $('#recebe_miolo').empty().html(jqXHR.responseText).css('height', 'auto');
            $('#breadcrumb').html('> Cadastro &Uacute;nico > Erro Interno');
            reject(new Error('Erro na requisição.'));
          },
          complete: () => {
            loading(false);
          },
          dataType: 'html'
        });
      });
    };

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

    await fetchData(url, data)
      .then(async () => {
        if (selectedOption === '1' && mode === 1) {
          cadunAlterarFamilia() //native function in page
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
      });
  }

  document.getElementById('searchSubmitAf').addEventListener('click', async () => {
    await findPerson(1)
  })

  document.getElementById('searchSubmitN').addEventListener('click', async () => {
    findPerson(2)
  })

  document.getElementById('searchSubmitFr').addEventListener('click', async () => {
    findPerson(3)
  })

  document.getElementById('searchSubmitFp').addEventListener('click', async () => {
    findPerson(4)
  })

}

const frmSubmitMod = (action) => {
  return new Promise((resolve, reject) => {
    loading(true);
    let form = document.getElementById("formularioForm");

    $.ajax({
      type: "POST",
      url: action,
      data: $(form).serialize(),
      success: function (data) {
        $("#recebe_miolo").empty().html(data);
        resolve();
      },
      error: function (jqXHR) {
        $("#recebe_miolo").empty().html(jqXHR.responseText).css("height", "auto");
        $("#breadcrumb").html("> Cadastro &Uacute;nico > Erro Interno");
        reject(new Error("Erro na requisição."));
      },
      complete: function () {
        loading(false)
      },
      dataType: "html"
    });
  });
};

const addEscolaridadeShortcut = () => {

  const initEscCadCrawler = async (url) => {
    cadunSelecionaPessoa(''); //native function in page
    // if (addPessoa != null) setAdicionarPessoa('', addPessoa); //native function in page
    setConsultarPessoa('', false); //native function in page

    await frmSubmitMod(url)

    if (document.body.contains(document.getElementById('L_aviso'))) {
      document.getElementById("codigoMembroFamiliarTemp").value = document.getElementById("codigoMembroFamiliarAux").value;
      document.getElementById("codigoMembroFamiliar").value = document.getElementById("codigoMembroFamiliarAux").value;

      await frmSubmitMod("carregarTelasPessoa.do?acao=iniciarAlterar&continuarAtualizacaoPessoa=true")

      await frmSubmitMod('iniciarAlterarEscolaridade.do?acao=iniciarAlterar')
    }
  }

  document.getElementById('escolarIconBtn')
    .addEventListener('click', initEscCadCrawler('carregarTelasPessoa.do?acao=confirmarSelecionarOutraPessoaParaEdicao&metodo=alterar'))
}

const addTrabalhoShortcut = () => {

  const initTrabCadCrawler = async (url) => {
    cadunSelecionaPessoa(''); //native function in page
    // if (addPessoa != null) setAdicionarPessoa('', addPessoa); //native function in page
    setConsultarPessoa('', false); //native function in page

    await frmSubmitMod(url)

    if (document.body.contains(document.getElementById('L_aviso'))) {
      document.getElementById('codigoMembroFamiliarTemp').value = document.getElementById('codigoMembroFamiliarAux').value;
      document.getElementById('codigoMembroFamiliar').value = document.getElementById('codigoMembroFamiliarAux').value;

      await frmSubmitMod('carregarTelasPessoa.do?acao=iniciarAlterar&continuarAtualizacaoPessoa=true')

      await frmSubmitMod('iniciarAlterarTrabalhoRemuneracao.do?acao=iniciarAlterar')

    }
  }

  document.getElementById('trabalhoIconBtn')
    .addEventListener('click', initTrabCadCrawler('carregarTelasPessoa.do?acao=confirmarSelecionarOutraPessoaParaEdicao&metodo=alterar'))
}

const addDefaultDataFill = () => {

  const runFunc = () => {
    const codCurrentPage = document.querySelector("#formularioForm").codigoTelaAtual.value;

    switch (codCurrentPage) {
      case "1":
        setFieldValues('input[name="formaColeta"]', 0);
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
        clickRadioButton('input[name="sabeLerEscrever"]', 1);
        setFieldValues('select[name="frequentaEscola"]', 4)
        break;
      case "8":
        clickRadioButton('input[name="trabalhouSemanaPassada"]', 1);
        clickRadioButton('input[name="afastadoSemanaPassada"]', 1);
        clickCheckBox('input[name="checkRemuneracaoMes"]', 0);
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
        clickRadioButton('input[name="programaBeneficioSesanItensSelecionados"]', 13);
        clickRadioButton('input[name="programaBeneficioPlanoNacionalDeErradicacaoDoTrabalhoEscravo"]', 1);
        clickRadioButton('input[name="programaBeneficioMinisterioDeMinasEEnergia"]', 3);
        clickRadioButton('input[name="programaBeneficioSnasItensSelecionados"]', 23);
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
    setFieldValues('input[name="cpfEntrevistador"]', cpfEntrevistador);
    setFieldValues('textarea[name="observacoes"]', observacoesTextoAv);

    function cadunObterEntrevistadorMod() {
      if (cpfEntrevistador.cadunTrim() == "") {
        $("#nomeEntrevistador").empty().html("CPF n&atilde;o informado.");
        return;
      }
      loading(true);

      return new Promise((resolve, reject) => {
        $.ajax({
          type: "GET"
          , url: 'AjaxRequestsServlet?acao=buscarEntrevistador&nameSpace=&cpf=' + cpfEntrevistador
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

  document.getElementById('autoAverIconBtn').addEventListener('click', initAutoUpdateCrawler())
}

function RunMods() {
  'use strict'
  if (!document.body.contains(document.querySelector('div#geralDadosUsuario'))) return

  addQuickSearchMenu();
  addEscolaridadeShortcut();
  addDefaultDataFill();
  addAutoAver();

  let intervalId = window.setInterval(function () {
    let el = document.querySelector('a[title="Emissão Comprovante Cadastro"]')
    if (el === null) return
    if (el.onclick) {
      el.setAttribute('onclick', "window.open('/cadun/ComprovanteCadastroServlet?telefoneOrgaoResponsavel=" + tel + "', '_self')")
    }
  }, 200)

  //clearInterval(intervalId)
}

RunMods()