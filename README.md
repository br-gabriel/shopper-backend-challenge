# Desafio Backend + Google Gemini - Shopper

## Descrição

Este projeto é uma aplicação backend desenvolvida em Node.js com TypeScript, que utiliza a API do Google Gemini para processar imagens e extrair informações numéricas. A aplicação permite o upload de imagens em base64 e o registro das medições em um banco de dados MongoDB. Além disso, a aplicação suporta verificação de duplicidade de leituras e oferece endpoints para listar e confirmar medições.

## Tecnologias Utilizadas

- **Node.js**: Ambiente de execução JavaScript do lado do servidor.
- **TypeScript**: Superset de JavaScript que adiciona tipagem estática.
- **Express**: Framework para criar APIs RESTful.
- **Google Gemini API**: API para processamento de imagens e extração de dados.
- **MongoDB**: Banco de dados NoSQL para armazenamento das medições.
- **Docker**: Ferramenta para criar, implantar e executar containers.

## Desafio

O desafio envolveu criar uma aplicação que:

1. Recebe imagens em base64.
2. Utiliza a API do Google Gemini para ler números das imagens.
3. Armazena as medições no MongoDB, verificando a validade dos dados e garantindo que não ocorra duplicidade de registro.
4. Fornece endpoints para listar medições e confirmar leituras.

## Configuração do Ambiente

### Requisitos

- **Node.js**: Versão 18 ou superior.
- **MongoDB**: Instância local ou serviço de MongoDB.
- **Docker** (opcional, para rodar em container).

### Instalação e Execução

1. **Clone o Repositório**

   ```bash
     git clone https://github.com/br-gabriel/shopper-backend-challenge.git
     cd shopper-backend-challenge
   ```

2. **Instale as Dependências**
   ```bash
    npm install
   ```

3. **Configuração do Ambiente**
   Crie um arquivo .env na raiz do projeto e adicione a chave da API do Google Gemini:
   ```bash
    GEMINI_API_KEY=sua_chave_da_api_aqui
   ```

4. **Executar o projeto**
   ```bash
    npm run start
   ```
### Docker

1. **Construa a Imagem Docker**

   ```bash
     docker build -t backend-shopper-challenge .
   ```

2. **Suba os Containers**
   ```bash
    docker-compose up
   ```

### Endpoints

- POST /upload: Recebe uma imagem em base64 e informações de medição. Retorna a URL da imagem e o valor lido.
- PATCH /confirm: Confirma o valor de uma medição existente, verificando duplicidade.
- GET /<customer code>/list?measure_type=WATER: Lista todas as medições para um cliente específico, com filtro opcional por tipo de medição (WATER ou GAS).
