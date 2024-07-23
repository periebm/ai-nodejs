import { IOpenApiRepository } from './chat.repository';
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser, CommaSeparatedListOutputParser } from '@langchain/core/output_parsers';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { PostgresChatMessageHistory } from '@langchain/community/stores/message/postgres';
import { database } from '../../config/database';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { formatDocumentsAsString } from 'langchain/util/document';
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";


export class ChatService {
  constructor(private repository: IOpenApiRepository) {}

  private async loader(
    model: ChatOpenAI<ChatOpenAICallOptions>,
  ) {
    //Loader
    const loader = new PDFLoader("src/features/chat/contrato.pdf", {
      parsedItemSeparator: "",
    });
  
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200, //amount of chars per chunk
      chunkOverlap: 20,
    });

    const splitDocs = await splitter.splitDocuments(docs); //this returns an array of parts of the splitted documents;

    const embeddings = new OpenAIEmbeddings();

    const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

    //Retrieving the Data
    const retriever = vectorStore.asRetriever({
      k: 2,
    });

    console.log(docs)
    return retriever;
  }

  public async chatMemory(message: string) {
    const model = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.7,
    });

    const questionPrompt = PromptTemplate.fromTemplate(
      `Você é um chatbot que deve responder ao usuário.
      ----------------
      CONTEXTO: {context}
      ----------------
      HISTÓRICO DE CHAT: {chatHistory}
      ----------------
      PERGUNTA: {question}
      ----------------
      Se você encontrar uma resposta relevante no contexto fornecido, forneça essa resposta e diga que foi encontrada no contexto. Caso contrário, gere uma resposta útil baseada nas informações gerais que você possui e informe que é uma informação geral.
      ----------------
      Resposta Útil:`
    );

    const chatHistoryPostgres = new PostgresChatMessageHistory({
      sessionId: '1',
      pool: database,
    });

    const chatMessages = await chatHistoryPostgres.getMessages();
    const chatHistory = chatMessages.map(msg => {
      if (msg instanceof HumanMessage) {
        return `Human: ${msg.content}`;
      } else if (msg instanceof AIMessage) {
        return `AI: ${msg.content}`;
      }
      return '';
    }).join('\n');
  
    const chain = RunnableSequence.from([
      {
        question: (input: { question: string; chatHistory?: string }) =>
          input.question,
        chatHistory: (input: { question: string; chatHistory?: string }) =>
          input.chatHistory ?? "",
        context: async (input: { question: string; chatHistory?: string }) => {
          const relevantDocs = await retriever.invoke(input.question);
          const serialized = formatDocumentsAsString(relevantDocs);
          return serialized;
        },
      },
      questionPrompt,
      model,
      new StringOutputParser(),
    ]);

    const input = message;

    const retriever = await this.loader(model);

    const resultOne = await chain.invoke({
      question: input,
      chatHistory
    });

    await chatHistoryPostgres.addAIMessage(resultOne);
    await chatHistoryPostgres.addUserMessage(input);

    return { response: resultOne };
  }
}
