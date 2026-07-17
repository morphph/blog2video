# Transcript: You Can Learn AI Agent Harness & Loop Engineering In 19 Min | LLM Ops, Eval, Tracing, RAG

**Channel:** Sean's AI Stories and AutoManus  
**URL:** https://www.youtube.com/watch?v=GrNbuWWJYiI  
**Duration:** 20:00

---

[0:00]
Hey everyone, this is Sean. So today we're going to go through probably the biggest buzzwords in AI agent system recently agent harness loop engineering ln ops which stands for large language models operations eval which stands for evaluation system for AI agents and these things become popular or become viral on the internet not because they are just some really complicated concepts instead they're actually very simple and I believe that simple building blocks will actually help us build the biggest architecture in the

[0:27]
world that will function like an intelligent system. Let's walk through this step by step. And it does not matter if you're technical or not. We're going to go through this and we'll make sure that you're equipped with the right knowledge for prompting your way through building such a system in the future. Let's jump in and get started. For those of you who have watched my previous video on AI agent memories, you're probably already familiar with this chart. This is an AI agent run, which means that it takes an input from a user

[0:52]
prompt. For example, you're asking Chad GPT or DeepSeek a question and say, "Hey, when was Sam Alman fired from OpenAI?" And then it's going to go through entire run, but the end goal is that you want to get a response. This is actually ephemeral, which means that there's no memory in this at all. We're sending that question, when was Sam Olton fired? And any chat history that's currently in the chat, for example, maybe we had some conversations before that, which for example could be, you should talk to me like Elon Musk

[1:17]
grilling on Samman because they don't like each other. And then these things will be fed into this thing called a working memory or a context RAM. In this video, we probably won't dive too much in depth into the memory system because there's a previous video talking about it already, but I'll just quickly go through it and then we'll introduce the concept of what a harness means. When you have this kind of short-term working memory, there will be an LLM or a large language model which performs as a

[1:40]
question and answer agent and at the end you're going to get a reply. But the problem with a simple agent run with simply just the question, current chat history, and system prompt is that the memory is very short-term. But when you run an AI agent system, sometimes we need extra memories. For example, how should the agent respond to the person? A procedural memory is exactly that. It basically tells the agent how to act and what are some of the instructions for this skill. We might also want the agent

[2:06]
to know some durable facts about this context. For example, I might want to compare my own earlystage startup journey with Sam Alman's early startup journey. We need this agent to have a memory of who I am, which in this context would be a durable facts or a semantic memory. Who Shawn is, what did he build in the past? These kind of things became a fact that you want your agent to know, but they're not publicly available if you're not famous because the AI model won't be trained on such information yet. But if you're famous

[2:32]
already, you can skip this. They already know who you are. And another thing we need is called episodic memory. and they include things like the past events or past chat history that does not exist in this current conversation. For example, I might suddenly be wondering when was the last time I was preparing for a job application and can we retrieve that information and match you know if we can get a job in CHIGBT. So these things will be retrieved from this thing called an episodic memory which is basically a

[2:56]
time series of the previous conversations or previous triggers that happen if you have a more complex system. So, for those of you who have watched my previous memory agent system design, you might be wondering, Sean, why are you repeating all of these things? And that is because if you think about the entire thing that we just covered in the past few minutes, we're really stating the one fact that a large language model can do these things by itself. It's like a really powerful brain that knows everything about

[3:22]
humanity, everything about science, anything that happened in human or biology history, but it does not know you. with you or the software who's running this AI agent system, a large language model has no clue with how you want it to perform. This is why the concept called harness becomes really important in this. What harness means literally is that it's a set of harness tools that you use to control a horse when you're doing a horse riding. Imagine this large language model is a horse, right? This horse is very

[3:51]
powerful. They can run around, but if you don't have a good set of tools to ride this horse, you could just get hurt. It might go anywhere. It might go somewhere random. If you're in a war, you don't want that to happen. And that's why we're doing all of these to make sure we have good control over this large language model and make sure we're utilizing it at its maximum potential. That's why in addition to just the question or use a prompt and getting the reply and we're feeding them all in as a

[4:16]
working memory which can be enhanced by these three memories we just talked about. And in order for these three memories to actually work, there's a bit more details and they're all included in harness. Remember harness means we're building this Asian framework to control this large language model so that it works the way we want. For those of you who study statistics or machine learning, you would understand that a large language model is actually predicting the probability of the next word that it should spit out. When

[4:42]
everything comes with probability, there's randomness in it. But when we solve problems, we sometimes don't want too much randomness. So that's why we need to have a good control over this technology. Now let's continue to finish this harness. There are lots of tools on the market that's already quite useful. For example, you could try uh tools like langraph, lane chain or paidantic and there are many others. In this video, we won't dive too much in depth into that and we're going to finish building up

[5:05]
this harness before we move on to the next topic. So again, for this agent to work properly, we need this memory system to work. But this memory system needs an update system because memory doesn't just exist or pop up from nowhere. You need to constantly update it. That's why we need a database to store all these memories so that when the agent is running in this agent run, it knows where to retrieve these memories. So whenever you see an icon like this, this is a database. Okay, procedural memory is basically remember

[5:31]
it's it's about instructions, right? It's about how the agent should be acting. It's like with a hardness on the horse, you want the horse to write faster or slower. Normally, these are just files or text. And that's why you probably heard of this buzz word called skills. skill is basically a piece of text in a markdown file that you feed into AI agent like claw code but if you want to harness the system well just having files and text is not enough and they're stored in databases say like AWS superbase Google cloud you know Azure

[5:58]
all these kind of places or you can set up your own server at home if you want but that's just too expensive you don't want to do that and in order for these hardness to work properly you also need to figure out how to store the memories okay so for example the episodic memory is the time series of the events that happened or the previous chat history. Again, the way we store it is actually very simple. You just track every single thing that happened and then it's going to become like a very long list of

[6:21]
things that happened in history with timestamps. Durable fact is a different story. You can either input it yourself or you want the system to sort of automatically evolve over time. And the way for it to evolve is that you want to consolidate some of the conversations into the semantic memory. If I'm running a D2C brand e-commerce company, perhaps my customers have talked to my customer service agents for a million times about how do I get reimbured if this product does not work. You want to consolidate

[6:45]
these conversations and distill them as a fact into the semantic memory. And that's why here we have a little gate here. If your brand has a million people purchasing products from it, let's say your Alibaba or Amazon, it just doesn't make sense and it's very expensive. So from a harness perspective, you want to be smart about this and you want the system to be automatic. And then a simple way is probably like maybe consolidate these timeordered events after every said 2,000 conversations because you have a million customers.

[7:09]
And then you can feed these things into a summarizer agent which is another large language model harness. You can define the system prompt in this one. You can probably feed it with some memories too. Uh you can configure different models. Maybe it could be a cheaper model because you're feeding too much text into it. So the context window is too big and probably these are very expensive. So you can use cheaper open source models if you want to. Having such a mechanism allows you to consistently update this memory system.

[7:37]
The data should be coming from the previous large language model replies. Again, let's review how this harness works. A user sent a prompt. We're in one agent runtime with the current chat history and how the agent should be performing the system prompt. We're preparing a working memory for this AI agent to be able to answer a question. And after every single time it answered a question, it will send these messages to this database. And then this database is basically feeding back to this working memory every single time when a

[8:08]
question is checking a relevant context. And at the same time because this database is too big sometimes you want to consolidate them into some summarized information or distilled facts so that they're stored properly in a semantic memory so that the retrieval of such memories is just faster. I know we talked about retrieval a lot and that's just another buzz word called rag which is retrieval augmented generations. I also have a few videos explaining what rags are. Feel free to watch them. There's a little bit of difference

[8:37]
between how we retrieve from semantic memory and episodic memory. For semantic memory, it's just racks because these are just facts and text or files, right? But then for episodic memory, remember this is a time series. Let's say we're still in this e-commerce store, right? The user question could be like what the previous 10 conversations that we had with this specific customer from the United. And then you might just need a SQL query to query something that's pretty recent from this episodic memory.

[9:01]
But if your question is like what were my previous 20 conversations that have customer complaints on the quality of the products and our agent did not successfully resolve. With such a question you not only need a SQL query which is just capturing the data events in the data table. You also want to do some semantic search and that's why here rag is important because it's checking for relevant information for you. You don't want the entire 2,000 messages. You want that 20 messages out of these 2,000 that are exactly relevant to what

[9:32]
you want. And because these complaints are in text, we need to do some retrieval augmented generation to match the semantic meanings between text and the user prompt so that you're fetching the right context for the working memory. By now, this is probably a fast walkthrough of the memory system again, but we're just thinking about it from a hardness perspective in this video. And remember for harness we're training this horse of LLM to run autonomously without having too much randomness. Okay, there's another piece of it that's quite

[10:01]
important which is the agent might not only just read the memory. It might also do some tasks or call some tools. When an agent calls tools, it might not necessarily be just one time call. It could be multiple times of calls. For instance, let's say this AI agent has a bunch of agentic tools such as help me schedule a meeting, help me read or write my customer relationship data from the CRM system or help me fetch the payment information, say from Stripe or Alip Pay. And here's something we should

[10:31]
be careful about. If we give this horse or this LLM technology full power, it could just continuously do this forever, right? or it might not even know what's the right time to stop or what is the right tool calls it should make when is the endpoint to decide okay this response is good enough let's move on to reply that's why we have this mechanism called end loop guard rails yes now we're talking about loop engineering one of the biggest buzzwords in the recent few months a loop is part of harness why

[10:59]
because a loop is also helping us to control this technology to make sure it runs the way we want it to run and example that could be helpful for you is that let's say the custom prompt is help me find out what customers are complaining about our products. What are some of the follow-ups we could do in order to uh win them back? And if they're asking for reimbursement, have we done the reimbursement or not? If not, can we do that? This is probably a series of questions, but sometimes we just dump all of these things into AI

[11:31]
agent. Okay. And after you have this prompt, this LLM Asian needs to decide, okay, what are some of the tools that could be helpful for me to finish this task loop here is basically an architectural thinking of when is good enough so that we stop and give the user or the business owner a reply. Okay, so what might happen here is that the LM agent is doing a bunch of tool calls. It's doing some thinking. It's saying let me read from our customer relationship management tool like Salesforce, Hopspot or Automatis and

[12:03]
then it's going to find out okay there were 30 customer complaints in the past 2 months 12 of them have got reimbursement the other eight have not got reimbursement so after the first initial fetch is probably responded to the AI agent right and the agent will be probably thinking okay the the task or the ask is that um can we can we follow up with some of those who did not get um the reimbursement right so and they probably like just make another tool calls and be like, "Hey, let's schedule a meeting with those customers who did

[12:33]
not get a reimbursement, which are the eight of them." If we go a little bit more advanced, we even just use the reimbursement trigger on Stripe or Alip Pay to refund the customer. Can you see that this is a loop until we finish the task? But of course, this is like a case-byase situation. It really depends on what your task is, how you built the system. So, there's no one solution fits all here. I'm just explaining what a loop is. The very very essential part of this loop is that it needs to know when

[12:57]
it should stop. That's why we need this end loop guardrails. The guardrails could just simply be the task is done and perhaps when the agent was doing the planning, it should confirm with the user what is a good ending point. It might clarify with you is this what you want? Reimburing the other eight people or should I just tell you who they are and you will follow up later. Right? These are two different decisions you can make and after you make you're basically telling the agent loop that there's an ending scenario. Another good

[13:21]
example I saw today is that you know when you're doing coding and claw code can just always pop up some windows and ask you for permissions right so the good way to use a loop engineering here is that you can set up a loop or set up a hook in claw code and telling it that you should always send me a notification on my laptop if you are pending on some permissions from me otherwise if I'm watching YouTube and then when I come back 30 minutes later I realize that clock code is stuck in that one permission like 25 minutes ago that will

[13:50]
be a waste of my time. Okay, so you can set up a loop like this to make sure that there's a way to send you notification pop-ups so that you know the loop has ended or it needs your input again. Are you guys still with me? Good. So, by far we have covered AI agent run with a memory system with a loop engineering around the large language model agent which has a trigger to end the loop so that it sends a reply to the user and basically this whole thing is an AI agent harness system. What's next is one of the other biggest

[14:20]
buzzwords that Y combinator always mentions which is aval or LLM ops. Let's jump into it. But firstly I want you to understand why do we need LM ops here. Let's still look at the left hand side with this hardened system. The biggest problem here is that we don't know how well it's performing and that's why we need a feedback loop to help us understand is this agent actually performing properly right for my business or for my use case and can I continuously get feedback on how do we fix it and actually fix it ourselves

[14:53]
okay and when we say fix it a simple way to understand it is that can we have a better system prompt can we have a better large language model configurations Is there something we should change for how we retrieve the AI agent memories? These are kind of things that we can continue to iterate. But in order to iterate to make sure this system runs properly, we need a way to evaluate it, diagnose problems, solve the problems until it's a healthy and wellperforming system. And that is called large language model operations system, LLM

[15:28]
ops. So again in order to understand this properly we need to come back to what an agent run is. So an agent run you can simply understand it as a user question is sent to a large language model and you get a reply that is one agent run but in this agent run the agent tool calling could happen multiple times that does not matter right we're just talking about from a user input to a response from agent perspective that's one agent run and then we're going to introduce this system called a tracing system so every agent run we should

[16:01]
trace like a tree of events that happened and There are lots of tools that could help you with that. It could be landfuse, could be lensmith, etc., etc. A tree of events could be like what did the person actually ask? What retrievalss did the model actually retrieve? How many times did the large language model actually call the tools? And how was the tool usage? How was the response time, right? How long did it take for this entire system to run for checking latencies? And how many tokens have we used when we do these tool

[16:27]
calls, agent run, you know, doing this retrieval, augmented generation, these kind of things. So trace is helping us to track events basically and that's the first step. This is the step first to collect data and these data will be used for the following two purposes. Was it a good system run and was it healthy which corresponds to evaluation system. We can probably use large language model as a judge here to give us a score on how well it performed. For example, if the task had something to do with scheduling

[16:59]
meetings, did the meeting actually triggered? How long was the response for an agent to reply to a question? Was it 20 seconds or was it two milliseconds? And also things like how many tokens have we used? These two are basically in the same system. You can write it as deterministic code. You can use an AI agent to do it. But this is like part of the procedure which is helping us to understand was this a healthy system and was it a good system. And after that we're going to diagnose okay where and

[17:24]
why something was broken. For example, the meeting scheduling event was never triggered. Why was that? Right? Okay, we want to understand why was that and we could probably feed that into a coding agent in claw to sort of deep dive into it. Or you know if the latency is 20 second instead of 2 milliseconds something's wrong. Maybe one of the tool call is taking too much time. Maybe the working memory is too large. Uh so that the response time for a large language model to a memory retrieval is just

[17:52]
taking too much time. Maybe not every single question requires a retrieval from all these gigantic memory system. Maybe you're just asking a simple question be like when was my birthday? When was OpenAI started and these kind of information you probably don't need to do a ton of retrieval. The model itself already knows. So you basically want this system to provide a dashboard for you to understand the metrics and then with these metrics you can diagnose what is going wrong. And then we're going to have a little gate here which

[18:18]
is if the evaluation system passed well you can define the rules. We can either ship some very simple fix have a new version of the prompt or update the model configuration you know some tool changes or the parameters for retrievalss the LM ops will feed the improved system prompt and the configuration of the model back to this agent run system when then one LM ops loop is finished if let's say something is deeply broken right we cannot just simply ship the latest version of the prompt then we should go fix the bug

[18:49]
rerun the agent run resend the and then retrace the events and then redo this evaluation system in this LLM ops architecture. So now let's zoom out and look at this chart one more time. We covered what an AI agent run is. We covered how it would retrieve information from memories and we understood how an LLM agent would ask questions, would call tools to help it finish the task in a loop and it knows when to stop the loop so that we can get the reply. This whole thing is a set of harness tools that we're controlling

[19:20]
this horse, this technology to run in the right direction, okay? To do the right task. And at the same time, we have like a health checking system or evaluation system to understand how every single run is being traced, is being observed and how do we diagnose some problems and fix some problems and ship the latest updates of the prompt, about model configuration, about all these parameters or knobs that needs to be updated. So that this system will be an autonomous system that will just self- evolve and grow over time. I

[19:53]
really hope this was helpful. Let me know what you think and you have any questions, you can always reach out to me. I'll see you in the next video. Thanks so much.
