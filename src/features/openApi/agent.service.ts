import { IOpenApiRepository } from './openApi.repository';
import { ChatOpenAI} from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { CheerioWebBaseLoader } from '@langchain/community/document_loaders/web/cheerio';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { OpenAIEmbeddings } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { MessagesPlaceholder } from '@langchain/core/prompts';
import { createOpenAIFunctionsAgent, AgentExecutor } from 'langchain/agents';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import  { createInterface } from 'readline';
import {createRetrieverTool} from 'langchain/tools/retriever'

export class AgentService {
  constructor(private repository: IOpenApiRepository) {}

  public async agentOne() {
    const model = new ChatOpenAI({
      modelName: 'gpt-3.5-turbo-1106',
      temperature: 0.7,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', 'You are a helpful assistant called Ashley'],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad'),
    ]);

    /****** LOADER *******/
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

    //Retrieving the Data
    const retriever = vectorStore.asRetriever({
      k: 2,
    });
    /****** LOADER *******/


    //Create and assign tools
    const searchTool = new TavilySearchResults();
    const retrieverTool = createRetrieverTool(retriever, {
      name: 'lcel_search',
      description: 'Use this tool when searching for information about Langchain Expression Language (LCEL)'
    })
    const tools = [searchTool, retrieverTool];

    //Create Agent  (Now is agent instead of chain)
    const agent = await createOpenAIFunctionsAgent({
      llm: model,
      prompt,
      tools,
    });

    //Create Agent Executor
    const agentExecutor = new AgentExecutor({
      agent,
      tools,
    });

    //Get user input
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const chatHistory: any = [];


    const askQuestion = () => {
      rl.question('User: ', async (input) => {

        if(input.toLowerCase() === 'exit') {
          rl.close();
          return;
        }

        //Call Agent
        const response = await agentExecutor.invoke({
          input: input,
          chat_history: chatHistory
        });

        console.log('Agent: ', response.output);
        chatHistory.push(new HumanMessage(input));
        chatHistory.push(new AIMessage(response.output));

        askQuestion();
      });
    };

    askQuestion();
  }
}
