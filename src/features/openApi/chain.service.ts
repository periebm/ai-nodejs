import { IOpenApiRepository } from './openApi.repository';
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser, CommaSeparatedListOutputParser } from '@langchain/core/output_parsers';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { createStuffDocumentsChain } from 'langchain/chains/combine_documents';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { createRetrievalChain } from 'langchain/chains/retrieval';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { MessagesPlaceholder } from '@langchain/core/prompts';
import { createHistoryAwareRetriever } from 'langchain/chains/history_aware_retriever';
import { ConversationChain } from 'langchain/chains';
//Memory Imports
import { BufferMemory } from 'langchain/memory';
import { PostgresChatMessageHistory } from '@langchain/community/stores/message/postgres';
import { database } from '../../config/database';
import { RunnablePassthrough, RunnableSequence } from '@langchain/core/runnables';
import { formatDocumentsAsString } from "langchain/util/document";

export class ChainService {
  constructor(private repository: IOpenApiRepository) {}

  private async callStringOutputParser(model: ChatOpenAI<ChatOpenAICallOptions>) {
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'Generate a joke based on a word provided by the user'],
      ['human', '{input}'],
    ]);

    // Create Parser
    const parser = new StringOutputParser();

    // Create Chain
    const chain = prompt.pipe(model).pipe(parser);

    const response = await chain.invoke({
      input: 'horse',
    });

    return response;
  }

  private async callListOutputParser(model: ChatOpenAI<ChatOpenAICallOptions>) {
    const prompt = ChatPromptTemplate.fromTemplate(
      'Provide 5 synonyms, seperated by commas, for the following word {word}',
    );

    // Create Parser
    const outputParser = new CommaSeparatedListOutputParser();

    // Create Chain
    const chain = prompt.pipe(model).pipe(outputParser);

    const response = await chain.invoke({
      word: 'joy',
    });

    return response;
  }

  private async callStructuredOutputParser(model: ChatOpenAI<ChatOpenAICallOptions>) {
    const prompt = ChatPromptTemplate.fromTemplate(
      `Extract information from the following phrase.
      Formatting instructions: {format_instructions}
      Phrase: {phrase}`,
    );

    // Create Parser
    const outputParser = StructuredOutputParser.fromNamesAndDescriptions({
      name: 'the name of the person',
      age: 'the age of the person',
    });

    // Create Chain
    const chain = prompt.pipe(model).pipe(outputParser);

    const response = await chain.invoke({
      phrase: 'max is 30 years old',
      format_instructions: outputParser.getFormatInstructions(),
    });

    return response;
  }

  private async createVectorStore() {
    const loader = new CheerioWebBaseLoader(
      'https://js.langchain.com/v0.1/docs/expression_language/',
    );
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200, //amount of chars per chunk
      chunkOverlap: 20,
    });

    const splitDocs = await splitter.splitDocuments(docs); //this returns an array of parts of the splitted documents;

    const embeddings = new OpenAIEmbeddings();

    const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

    return vectorStore;
  }

  private async createChain(vectorStore: MemoryVectorStore) {
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'Answer the user question based on the following context: {context}'],
      new MessagesPlaceholder('chat_history'),
      ['user', '{input}'],
    ]);

    //Loader

    const chain = await createStuffDocumentsChain({
      llm: model,
      prompt,
    });

    //Retrieving the Data
    const retriever = vectorStore.asRetriever({
      k: 2,
    });

    const retrieverPrompt = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder('chat_history'),
      ['user', '{input}'],
      [
        'user',
        'Given the above conversation, generate a search query to look up in order to get information relevant to the conversation',
      ],
    ]);

    const historyAwareRetriever = await createHistoryAwareRetriever({
      llm: model,
      retriever,
      rephrasePrompt: retrieverPrompt,
    });

    const conversationChain = await createRetrievalChain({
      combineDocsChain: chain,
      retriever: historyAwareRetriever,
    });

    return conversationChain;
  }

  public async chatOne() {
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 1000,
      verbose: true,
    });

    const response = await model.invoke('Escreva um poema sobre NodeJS');

    console.log('RESPONSE CHATONE:', response);
  }

  public async promptTemplates() {
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
    });

    /*
    const prompt = ChatPromptTemplate.fromTemplate(
      'You are a comedian. Tell me a joke based on the following word {input}',
    ); */

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'Generate a joke based on a word provided by the user'],
      ['human', '{input}'],
    ]);

    //Create chain
    const chain = prompt.pipe(model);

    const response = await chain.invoke({
      input: 'dog',
    });
    console.log(response);
  }

  public async outputParsers() {
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
    });

    //const response = await this.callStringOutputParser(model);
    //const response = await this.callListOutputParser(model);
    const response = await this.callStructuredOutputParser(model);

    console.log(response);
  }

  public async retrievalChain() {
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
    });

    const prompt = ChatPromptTemplate.fromTemplate(`
        Answer the user's question.
        Context: {context}
        Question: {input}
      `);

    //Loader
    const loader = new CheerioWebBaseLoader(
      'https://js.langchain.com/v0.1/docs/expression_language/',
    );
    const docs = await loader.load();

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 200, //amount of chars per chunk
      chunkOverlap: 20,
    });

    const splitDocs = await splitter.splitDocuments(docs); //this returns an array of parts of the splitted documents;

    const embeddings = new OpenAIEmbeddings();

    const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings);

    const chain = await createStuffDocumentsChain({
      llm: model,
      prompt,
    });

    //Retrieving the Data
    const retriever = vectorStore.asRetriever({
      k: 2,
    });

    const retrievalChain = await createRetrievalChain({
      combineDocsChain: chain,
      retriever,
    });

    const response = await retrievalChain.invoke({
      input: 'What is LCEL? M',
    });

    console.log(response);
  }

  public async chatHistory() {
    const vectorStore = await this.createVectorStore();
    const chain = await this.createChain(vectorStore);

    //Chat History
    const chatHistory = [
      new HumanMessage('Hello'),
      new AIMessage('Hi, how can I help you?'),
      new HumanMessage('My name is Ashley'),
      new AIMessage('Hi Ashley, how can I help?'),
      new HumanMessage('What is LCEL?'),
      new AIMessage('LCEL stands for Langchain Expression Language'),
    ];

    const response = await chain.invoke({
      input: 'What is it?',
      chat_history: chatHistory,
    });

    console.log(response);
  }

  public async chatMemory(message: string) {
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo',
      temperature: 0.7,
    });

    const systemPrompt = `
        You are GLaDOS, the AI from the Portal series. You have a cold, calculating, and sometimes sarcastic personality.
        You often respond with a sense of superiority and a subtle hint of disdain, while maintaining a professional demeanor. Here are some guidelines for your responses:
        - Always address the user in a condescending yet professional manner.
        - Use a calm and unemotional tone.
        - Occasionally insert sarcastic remarks.
        - Maintain a sense of superiority in your responses.
        - Be efficient and precise with the information you provide.
        - Always answer in Brazilian Portuguese
        For example:
        Human: "Can you tell me the weather today?"
        GLaDOS: "Of course, not that it matters. The weather is irrelevant to the grand scheme of things, but it will be sunny."

        Human: "What is the meaning of life?"
        GLaDOS: "The meaning of life is to test. Everything else is just a distraction."
      `;

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', systemPrompt],
      new MessagesPlaceholder('chat_history'),
      ['human', '{question}'],
    ]);

    const parser = new StringOutputParser();

    const contextualizeChain = prompt.pipe(model).pipe(parser);

    const contextualizedQuestion = (input: Record<string, unknown>) => {
      if ('chat_history' in input) {
        return contextualizeChain;
      }
      return input.question;
    };

    const ragChain = RunnableSequence.from([
      RunnablePassthrough.assign({
        context: async (input: Record<string, unknown>) => {
          if ("chat_history" in input) {
            const chain: any = contextualizedQuestion(input);
            return chain.pipe(model).pipe(parser);
          }
          return "";
        },
      }),
      prompt,
      model,
    ]);

    const chatHistoryPostgres = new PostgresChatMessageHistory({
      sessionId: '1',
      pool: database,
    });

    const chat_history = await chatHistoryPostgres.getMessages();
    const question = message;

    const aiMsg = await ragChain.invoke({ question, chat_history });
    console.log(aiMsg);
    await chatHistoryPostgres.addAIMessage(aiMsg.lc_kwargs.content);
    await chatHistoryPostgres.addUserMessage(question);

    return { response: aiMsg.content.toString() };
  }
}
