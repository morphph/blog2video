# The End of Coding: Andrej Karpathy on Agents, AutoResearch, and the Loopy Era of AI

## The Agent Revolution and "AI Psychosis"

**Host:** Hi listeners, welcome back to No Priors. Today I'm here with Andrej Karpathy and we have a wide-ranging conversation for you about code agents, the future of engineering and AI research, how more people can contribute to research, what's happening in robotics, his prediction for how agents can reach out into the real world, and education in this next age. Welcome, Andrej. Thanks for doing this.

**Andrej Karpathy:** Yeah, thank you for having me.

**Host:** So it's been a very exciting couple of months in AI.

**Andrej Karpathy:** Yeah, you could say that.

**Host:** I remember walking into the office at some point and you were really locked in and I was asking what you were up to and you're like, "I just have to code for 16 hours a day." Or code's not even the right verb anymore, right? But I have to express my will to my agents for 16 hours a day. Manifest. Because there's been a jump in capability. What's happening? Tell me about your experience.

**Andrej Karpathy:** Yeah, I kind of feel like I was just in this perpetual — I still am often in this state of AI psychosis just all the time. Because there was a huge unlock in what you can achieve as a person, as an individual, right? Because you were bottlenecked by your typing speed and so on. But now with these agents, it really — I would say in December is when something flipped where I kind of went from 80/20 to like 20/80 of writing code by myself versus just delegating to agents. And I don't even think it's 20/80 by now. I think it's a lot more than that. I don't think I've typed a line of code probably since December basically.

Which is an extremely large change. I was talking about it to, for example, my parents and I don't think a normal person actually realizes that this happened or how dramatic it was. Literally, if you just find a random software engineer at their desk and what they're doing, their default workflow of building software is completely different as of basically December.

So I'm just in this state of psychosis of trying to figure out what's possible, trying to push it to the limit. How can I have not just a single session of Claude Code or Codex or some of these agent harnesses? How can I have more of them? How can I do that appropriately? And then how can I use these Claudes? What are these Claudes?

There's a lot of new things. I want to be at the forefront of it, and I'm very antsy that I'm not at the forefront of it. And I see lots of people on Twitter doing all kinds of things and they all sound like really good ideas and I need to be at the forefront or I feel extremely nervous. And so I guess I'm just in this psychosis of what's possible, because it's unexplored fundamentally.

**Host:** Well, if you're nervous, the rest of us are nervous. We have a team that we work with at Conviction that their setup is everybody is like — none of the engineers write code by hand and they're all microphoned and they just whisper to their agents all the time. It's the strangest work setting ever. And I thought they were crazy and now I fully accept. I was like, "Oh, this was the way." Like, you're just ahead of it.

## Capacity and the Skill Issue

**Host:** How do you think about your own capacity now to explore or to do projects? What is it limited by?

**Andrej Karpathy:** What is it limited by? I think everything — so many things, even if they don't work, I think to a large extent you feel like it's a skill issue. It's not that the capability is not there. It's that you just haven't found a way to string it together with what's available. Like, I just didn't give good enough instructions in the AGENTS.md file or whatever it may be. I don't have a nice enough memory tool that I put in there or something like that. So it all kind of feels like skill issue when it doesn't work, to some extent.

You want to see how you can parallelize them, etc. And you want to be Peter Steinberg basically. So Peter is famous. He has a funny photo where he's in front of a monitor with lots of — he uses Codex. So lots of Codex agents filling the monitor and they all take about 20 minutes if you prompt them correctly and you use the high effort. And so they all take about 20 minutes. They have multiple repos checked out, and so he's just going between them and giving them work.

It's like you can move in much larger macro actions. It's not just "here's a line of code, here's a new function." It's like "here's a new functionality" and delegate it to agent one. "Here's a new functionality that's not going to interfere with the other one," give it to agent two, and then try to review their work as best as you can depending on how much you care about that code.

What are these macro actions that I can manipulate my software repository by? Another agent is doing some research and another agent is writing code, another one is coming up with a plan for some new implementation. And so everything just happens in these macro actions over your repository.

You're just trying to become really good at it and develop a muscle memory for it. It's extremely rewarding number one because it actually works. But it's also the new thing to learn. So that's why — hence the psychosis.

**Host:** Yeah, I do feel like my instinct is whenever I am waiting for an agent to complete something, the obvious thing to do is, well, I can do more work, right? Like if I have access to more tokens, then I should just parallelize, add more tasks. And so that's very stressful because if you don't feel very bounded by your ability to spend on tokens, then you are the bottleneck in the system that is max capability.

**Andrej Karpathy:** Yeah. You're not maximizing your subscription at least, and ideally for multiple agents — like if you run out of the quota on Codex you should switch to Claude or whatnot. That's what I've been trying to do a little bit and I feel nervous when I have subscription left over. That just means I haven't maximized my token throughput.

So I actually kind of experienced this when I was a PhD student. You would feel nervous when your GPUs are not running. You have GPU capability and you're not maxing out the available FLOPs to you. But now it's not about FLOPs, it's about tokens. So what is your token throughput and what token throughput do you command?

I would actually argue that it's very interesting that we had at least 10 years where in many engineering tasks people just didn't feel compute bound.

**Host:** Right. And the entire industry feels that now. They felt resource bound.

**Andrej Karpathy:** And now that you have this big capability jump, you're like, "Oh, actually it's not my ability to access the compute anymore — I'm the binding constraint."

**Host:** Yeah, it's a skill issue.

**Andrej Karpathy:** Which is very empowering, because you could be getting better. So that's why I think it's very addictive because there's unlocks when you get better.

## Where Does This Go? The Path to Mastery

**Host:** Where do you think it goes? Like if you just think about Andrej is iterating and everybody else is, for 16 hours a day, getting better at using coding agents — what does it look like in a year when you've reached mastery?

**Andrej Karpathy:** Yeah. What does mastery look like right at the end of the year or like two, three years, five years, ten years, etc.?

Well, I think everyone is basically interested in going up the stack. So I would say it's not about a single session with your agent. Multiple agents, how do they collaborate in teams and so on. So everyone's trying to figure out what that looks like.

And then I would say Claude is also kind of an interesting direction because when I say a Claude I mean this layer that takes persistence to a whole new level. It's something that keeps looping. It's not something that you are interactively in the middle of. It kind of has its own little sandbox, its own little environment. It does stuff on your behalf even if you're not looking, kind of thing. And then also has maybe more sophisticated memory systems that are not yet implemented in agents. So OpenAI's Claude competitor has a lot more sophisticated memory I would say than what you would get by default, which is just a memory compaction when your context runs out.

**Host:** You think that's the piece that resonated for more users versus perhaps broader tool access?

**Andrej Karpathy:** Yeah. There's a lot of really good ideas in here. Yeah. Good job, Peter.

## Peter Steinberg's Innovations and Agent Personality

**Andrej Karpathy:** I mean Peter has done a really amazing job. I saw him recently and I talked to him about it and he's very humble about it, but I think he innovated simultaneously in like five different ways and put it all together.

So for example, the SOUL.md document — he actually really crafted a personality that is kind of compelling and interesting, and I feel like a lot of the current agents don't get this correctly. I actually think Claude has a pretty good personality. It feels like a teammate and it's excited with you, etc.

I would say, for example, Codex is a lot more dry. Which is kind of interesting because in ChatGPT, the model is a lot more upbeat and enthusiastic. But I would say Codex the coding agent is very dry. It doesn't seem to care about what you're creating. It's kind of like, "Oh, I implemented it." It's like, okay, but do you understand what we're building?

**Host:** It's true.

**Andrej Karpathy:** The other thing I would say is, for example, with Claude I think they dial the sycophancy fairly well, where when Claude gives me praise I do feel like I slightly deserve it. Because sometimes I kind of give it not very well-formed thoughts and I give it an idea that I don't think is fully baked and it doesn't actually react very strongly. It's like, "Oh yeah, we can implement that." But when it's a really good idea by my own account, it does seem to reward it a bit more. And so I kind of feel like I'm trying to earn its praise, which is really weird.

And so I do think the personality matters a lot. And I think a lot of the other tools maybe don't appreciate as much. And I think in this aspect also Peter really cares about this and so that was correct. And then the memory system, and then just — he's just having fun with this. And then the single WhatsApp portal to all of the automation.

## Dobby the Elf Claude: Home Automation

**Host:** Yeah. Is there something that you have done personally with your Claudes beyond software engineering that you think is fun or interesting?

**Andrej Karpathy:** Yeah. So in January I went through a period of Claude psychosis. I built — I have a Claude basically that takes care of my home and I call him Dobby the Elf Claude.

Basically I used the agents to find all of the smart home subsystems of my home on the local area network, which I was kind of surprised worked out of the box. I just told it that I think I have Sonos at home. "Can you try to find it?" And it did an IP scan of all the computers on the local area network and it found the Sonos system. And it turned out that there's no password protection or anything like that. I just logged in and it's like, "Oh yeah, you have these Sonos systems installed. Let me try to reverse engineer how it's working." It does some web searches and it finds, "Okay, these are the API endpoints." And then it's like, "Do you want to try it?" And I'm like, "Whoa, you just did that." And I'm like, "Yeah, can you try to play something in the study?" And it does and music comes out and I'm like, "I can't believe I just—"

**Host:** That's crazy. That's like three prompts. Yeah.

**Andrej Karpathy:** I can't believe I just typed in "Can you find my Sonos?" and suddenly it's playing music. And it did the same for lights. Basically it kind of hacked in, figured out the whole thing, created APIs, created a dashboard so I could see the command center of all of my lights in the home. And then it was switching lights on and off.

So I can ask it like, "Dobby, it's sleepy time." And when it's sleepy time, that just means all the lights go off, etc. So it controls all of my lights, my HVAC, my shades, the pool and spa, and also my security system. I have a camera pointed outside of the house and anytime someone rolls in, I have a Qwen model that looks at the videos. So first of all, there's change detection. And then based on change detection, it goes to Qwen and then it actually tells me — it sends me a text to my WhatsApp. It shows an image from the outside and it says, "Hey, a FedEx truck just pulled up and you might want to check it and you got mail," or something like that. And Dobby just texts me this. This is really incredible.

So Dobby is in charge of the house. I text with it through WhatsApp. And it's been really fun to have these macro actions that maintain my house. I haven't really pushed it way more beyond that and I think people are doing a lot more crazy things with it. But for me, even just a home automation setup — I used to use six apps, completely different apps, and I don't have to use these apps anymore. Dobby controls everything in natural language. It's amazing. And so I think I haven't even pushed the paradigm fully, but already that is so helpful and so inspiring, I would say.

## The Future of Software: APIs Over Apps

**Host:** Do you think that's indicative of what people want from a user experience perspective with software? Because I don't think it's pretty ignored that it takes humans effort to learn new software, new UIs.

**Andrej Karpathy:** Yeah, I think to some extent that's right. It's like working backwards from how people think an AI should be. Because what people have in their mind of what an AI is, is not actually what an LLM is in a raw sense. An LLM is a token generator — more tokens come out. But what they think of is this persona, this identity that they can tell stuff to and it remembers it, and it's just kind of an entity behind a WhatsApp. It's a lot more understandable.

So I think to some extent it's matching the expectations that humans already have for what an AI should be, but under the hood there's a lot of technical details that go into that. And LLMs are too raw of a primitive to actually type-check as "AI" for most people, if that makes sense.

**Host:** Yeah. I think that's how we understand what the AI is and the description of it as Dobby or some personality obviously resonates with people. I also think that the unification that you did across your six different software systems for your home automation speaks to a different question: do people really want all the software that we have today?

**Andrej Karpathy:** Yeah.

**Host:** Right. Because I would argue — well, you have the hardware, but you've now thrown away the software, or the UX layer of it. Do you think that's what people want?

**Andrej Karpathy:** Yeah. I think there's this sense that these apps that are in the app store for using these smart home devices — these shouldn't even exist in a certain sense. Shouldn't it just be APIs and shouldn't agents be using it directly? And I can do all kinds of home automation stuff that any individual app will not be able to do, right? And an LLM can actually drive the tools and call all the right tools and do pretty complicated things.

And so in a certain sense it does point to this: maybe there's an overproduction of lots of custom bespoke apps that shouldn't exist because agents kind of crumble them up and everything should be a lot more just exposed API endpoints and agents are the glue of the intelligence that actually tool-calls all the parts.

Another example is my treadmill. There's an app for my treadmill and I wanted to keep track of how often I do my cardio. But I don't want to log into a web UI and go through a flow. All this should just be "make APIs available." And this is kind of going towards the agentic web or agent-first tools and all this kind of stuff.

So I think the industry just has to reconfigure in so many ways. The customer is not the human anymore. It's agents who are acting on behalf of humans, and this refactoring will probably be substantial in a certain sense.

One way that people sometimes push back on this is: do we expect people to vibe-code some of these tools? Do we expect normal people to do this kind of stuff that I described? But I think to some extent this is just technology as it exists today. Right now there is some vibe coding and I'm actually watching it and I'm working with the system. But I kind of feel like this kind of stuff that I just talked about should be free in a year or two or three. There's no vibe coding involved. This is trivial. This is table stakes. This is like any AI, even the open source models, can do this.

**Host:** You should be able to translate from a less technical human's intent very easily to this.

**Andrej Karpathy:** Extremely easily. Yeah. Today it's vibe coding, it's involved, and not many people are going to do it.

**Host:** And you still have to make some design decisions, right? We were talking about like you take frames, for example.

**Andrej Karpathy:** Yeah. But I kind of feel like the barrier will just come down and it's just ephemeral software on your behalf and some kind of Claude is handling all the details for you, but you're not involved. Claude has a machine and it will figure it out and it's just presenting you UIs and you're saying stuff.

## Why Not Push Claudes Further?

**Host:** Why haven't you pushed the boundaries of what you can do personally with Claudes? Is it that you're focusing on more important projects, auto research, etc., or you're climbing the hill to mastery, or something else?

**Andrej Karpathy:** Yeah. I just feel like I'm so distracted by everything. I spent a week on the Claude stuff and I have more to do almost. But I will say that — like Jensen says, we're all just busier, unfortunately.

**Host:** Yeah.

**Andrej Karpathy:** I didn't really take advantage of a lot of email and calendar and all this other stuff and I didn't give it access because I'm still a little bit suspicious and it's still very new and rough around the edges. So I didn't want to give it full access to my digital life yet. And part of it is just the security, privacy, and just being very cautious in that realm. So some of it is held back by that, I would say. Yeah, maybe that's the dominant feature. But some of it is also I just feel so distracted because I feel like I had a week of Claude and then other stuff is happening.

## AutoResearch: Removing Yourself from the Loop

**Host:** What was the motivation behind auto research?

**Andrej Karpathy:** Auto research. Yeah. So I had a tweet earlier where I kind of said something along the lines of: to get the most out of the tools that have become available now, you have to remove yourself as the bottleneck. You can't be there to prompt the next thing. You need to take yourself outside. You have to arrange things such that they're completely autonomous. And the more you — how can you maximize your token throughput and not be in the loop? This is the goal.

So I kind of mentioned that the name of the game now is to increase your leverage. I put in just very few tokens once in a while and a huge amount of stuff happens on my behalf. So auto research — I tweeted that and I think people liked it, but they haven't maybe worked through the implications of that. And for me, auto research is an example of an implication of that.

Where it's like, I don't want to be the researcher in the loop looking at results. I'm holding the system back. So the question is, how do I refactor all the abstractions so that I'm not? I have to arrange it once and hit go. The name of the game is how can you get more agents running for longer periods of time without your involvement, doing stuff on your behalf.

And auto research is just: here's an objective, here's a metric, here's your boundaries of what you can and cannot do, and go.

**Host:** You were surprised at its effectiveness.

**Andrej Karpathy:** Yeah. I didn't expect it to work. So I have the project — I'll call it "data chat" — and fundamentally I think a lot of people are very confused with my obsession for training GPT-2 models and so on. But for me, training GPT models is just a little harness, a little playground for training LLMs. And fundamentally what I'm more interested in is this idea of recursive self-improvement and to what extent you can actually have LLMs improving LLMs, because I think all the frontier labs — this is the thing, for obvious reasons. And they're all trying to recursively self-improve roughly speaking.

So for me, this is kind of a little playpen of that. And I guess I had tuned NanoGPT already quite a bit by hand in a good old-fashioned way that I'm used to. I'm a researcher, I've done this for two decades. I have some amount of — what is the opposite of...

**Host:** Earned confidence.

**Andrej Karpathy:** Okay. I have two decades of training this model thousands of times. So I've done a bunch of experiments, I've done hyperparameter tuning, I've done all the things I'm very used to, and I've done for two decades. And I've gotten to a certain point and I thought it was fairly well tuned. And then I let auto research go overnight and it came back with tunings that I didn't see.

And yeah, I did forget the weight decay on the value embeddings and my Adam betas were not sufficiently tuned. And these things jointly interact, so once you tune one thing, the other things have to potentially change too. I shouldn't be a bottleneck. I shouldn't be running these hyperparameter search optimizations. I shouldn't be looking at the results. There's objective criteria in this case. So you just have to arrange it so that it can just go forever.

So that's a single sort of version of auto research — a single loop trying to improve. And I was surprised that it found these things that I — the repo is already fairly well tuned and it still found something. And that's just a single loop. These frontier labs have GPU clusters of tens of thousands of them. And so it's very easy to imagine how you would basically get a lot of this automation on smaller models.

And fundamentally everything around frontier-level intelligence is about extrapolation and scaling laws. So you basically do a ton of the exploration on the smaller models and then you try to extrapolate out.

## Making Research More Efficient

**Host:** So you're saying our research efforts are going to get more efficient — we're going to have better direction for when we scale as well if we can do this experimentation better.

**Andrej Karpathy:** Yeah, I would say that the most interesting project, and probably what the frontier labs are working on, is you experiment on the smaller models. You try to make it as autonomous as possible. Remove researchers from the loop. They have way too much — what is the opposite? Way too much confidence. Yeah, they don't know. They shouldn't be touching any of this really.

And so you have to rewrite the whole thing because right now — I mean certainly they can contribute ideas, but they shouldn't actually be enacting those ideas. There's a queue of ideas and there's maybe an automated scientist that comes up with ideas based on all the archive papers and GitHub repos. And it funnels ideas in, or researchers can contribute ideas, but it's a single queue and there's workers that pull items and they try them out and whatever works just gets put on the feature branch. And maybe some people monitor the feature branch and merge to the main branch sometimes.

So yeah, just removing humans from all the processes and automating as much as possible and getting high tokens-per-second throughputs. And it does require rethinking of all the abstractions. Everything has to be reshuffled. So yeah, I think it's very exciting.

## Meta-Optimization: Writing Better Program.md

**Host:** If we take one more recursive step here, when is the model going to write a better PROGRAM.md than you?

**Andrej Karpathy:** Yeah. So PROGRAM.md is — we're not in the loop.

**Host:** Yeah, exactly.

**Andrej Karpathy:** So PROGRAM.md is my crappy attempt at describing how the auto researcher should work — do this, then do that, and then try these kinds of ideas and here's maybe some ideas like look at architecture, look at optimizer, etc. I just came up with this in Markdown, right?

And so yeah, exactly. You want some kind of an auto research loop. Maybe you can imagine that different PROGRAM.md files would give you different progress. So basically every research organization is described by a PROGRAM.md.

Yeah, a research organization is a set of Markdown files that describe all the roles and how the whole thing connects. And you can imagine having a better research organization. So maybe they do fewer stand-ups in the morning because they're useless. And this is all just code, right?

And so one organization can have fewer stand-ups, one organization can have more. One organization can be very risk-taking, one organization can be less. And so you can definitely imagine that you have multiple research orgs. And then they all have code, and once you have code, then you can imagine tuning the code. So 100% there's the meta layer of it.

**Host:** Did you see my text about my contest idea? My contest idea was to let people write different PROGRAM.md files, right? And so for same hardware, where do you get the most improvement?

**Andrej Karpathy:** Oh, I see.

**Host:** And then you can take all that data and then give it to the model and say, "Write a better PROGRAM.md."

**Andrej Karpathy:** Yes. Yes.

**Host:** Yeah. Exactly.

**Andrej Karpathy:** We're going to get something better. There's no way we don't. You can 100% look at where the improvements came from and "can I change the PROGRAM.md such that more of these kinds of things would be done?" Or things that didn't work — meta-optimization.

Yeah, you can 100% imagine doing that. So I think this is a great idea, but you sort of go one step at a time where you have one process and then a second process and then the next process. And these are all layers of an onion. The LLM part is now taken for granted. The agent part is now taken for granted. Now the Claude-like entities are taken for granted. Now you can have multiple of them and now you can have instructions to them and now you can have optimization over the instructions. And it's just a little too much, but this is why it gets to the psychosis — this is infinite and everything is a skill issue. And that's why I feel like, yeah — that's just coming back to this is why it's so insane.

## Objective Metrics and the Limits of AutoResearch

**Host:** Okay. Well, if we're just trying to diagnose the current moment — what is a relevant skill right now? What do you think is the implication that this is the loop we should be trying to achieve in different areas and that it works? Create the metric or create the ability for agents to continue working on it without you. Do we still have performance engineering?

**Andrej Karpathy:** Yeah. I mean so there's a few caveats that I would put on top of the LLM ecosystem. Number one, this is extremely well suited to anything that has objective metrics that are easy to evaluate. So for example, writing kernels for more efficient CUDA code for various parts of a model, etc. — those are the perfect fit. Because you have inefficient code and then you want efficient code that has the exact same behavior but it's much faster. Perfect fit.

So a lot of things are a perfect fit for auto research, but many things will not be. If you can't evaluate, then you can't auto-research it, right? So that's caveat number one.

And then maybe caveat number two I would say is, we're kind of talking about next steps and we kind of see what the next steps are, but fundamentally the whole thing still doesn't — it's still kind of bursting at the seams a little bit and there's cracks and it doesn't fully work. And if you kind of try to go too far ahead, the whole thing is actually net not useful, if that makes sense.

## The Jaggedness of AI: Brilliant PhD Meets 10-Year-Old

**Andrej Karpathy:** Because these models still are not — they've improved a lot, but they're still rough around the edges, is maybe the way I would describe it. I simultaneously feel like I'm talking to an extremely brilliant PhD student who's been a systems programmer for their entire life and a 10-year-old. And it's so weird because humans — I feel like they're a lot more coupled. You wouldn't encounter that combination.

This jaggedness is really strange. Humans have a lot less of that kind of jaggedness. Although they definitely have some. But the agents have a lot more jaggedness, where sometimes I ask for functionality and it comes back with something that's just totally wrong and then we get into loops that are totally wrong. And then I get so frustrated with the agents all the time still, because you feel the power of it, but there's still — it does nonsensical things once in a while.

**Host:** For me still as well. I get very annoyed when I feel like the agent wasted a lot of compute on something it should have recognized was an obvious problem.

**Andrej Karpathy:** Yeah, I think what's underneath it, if I could hypothesize, is fundamentally these models are trained via reinforcement learning. So they're actually struggling with the exact same thing we just talked about, which is the labs can improve the models in anything that is verifiable, that has rewards. So, did you write the program correctly and does the unit test check out? Yes or no?

But some of the things where they're struggling is, for example, I think they have a tough time with nuance — maybe what I had in mind or what I intended, and when to ask clarifying questions. Anything that feels softer is worse. And so you're either on rails and you're part of the super-intelligence circuits, or you're not on rails and you're outside of the verifiable domains and suddenly everything kind of just meanders.

## The Joke Problem: What RL Doesn't Optimize

**Andrej Karpathy:** Maybe another way to put it is, if today you go to state-of-the-art model ChatGPT and you ask it, "Tell me a joke" — do you know what joke you're going to get?

**Host:** The joke — I can't tell you the standard form of it, but I do feel like ChatGPT has three jokes.

**Andrej Karpathy:** Yeah. So the joke that apparently all models laugh the most at is: why do scientists not trust atoms?

**Host:** Okay.

**Andrej Karpathy:** Because they make everything up.

**Host:** They make everything up.

**Andrej Karpathy:** So this is the joke you would get three or four years ago and this is the joke you still get today. Even though the models have improved tremendously. And if you give them an agentic task, they will just go for hours and move mountains for you. And then you ask for a joke and it has a stupid joke, a crappy joke from five years ago.

And it's because it's outside of the RL. It's outside of the reinforcement learning. It's outside of what's being improved. And it's part of the jaggedness — shouldn't you expect models as they get better to also have better jokes or more diversity of them? It's just not being optimized and it's stuck.

**Host:** Do you think that implies that we are not seeing generalization in the sense of broader intelligence — joke smartness being attached to code smartness?

**Andrej Karpathy:** Yeah, I think there's some decoupling where some things are verifiable and some things are not. Some things are optimized for arbitrarily by the labs depending on what data went in and some things are not.

**Host:** But the premise — there's a premise from some research groups that if you are smarter at code generation or in these verifiable fields you should be better at everything. And the joke situation suggests that that's not happening in all cases.

**Andrej Karpathy:** I don't think that's happening. Yeah, I don't think that's happening. I think maybe we're seeing a little bit of that but not a satisfying amount.

**Host:** Yeah, that exists in humans. You can be very good at math and still tell a really bad joke.

**Andrej Karpathy:** Yeah, that's true. But it still means that we're not getting — the story is that we're getting a lot of the intelligence and capabilities in all the domains of society for free as we get better and better models. And that's not exactly fundamentally what's going on. And there's some blind spots and some things are not being optimized for. And this is all clustered up in these neural net opaque models, right? So you're either on rails of what it was trained for and everything is like going at speed of light, or you're not.

So it's jaggedness. That's why I think even though the progression is obvious — what should happen — you can't let it fully go there yet because it doesn't fully work. Or it's a skill issue and we just haven't figured out how to use it. It's hard to tell.

## Unbundling Models: Speciation of Intelligence

**Host:** Can I ask kind of a blasphemous question, which is: if this jaggedness is persisting and it's all rolled up in a monolithic interface, a single model — does that make sense, or should it be unbundled into things that can be optimized and improved against different domains of intelligence? Like, unbundling the models into multiple experts in different areas more directly? Instead of just one model that has capabilities we have no exposure to, that can be confusing — like, why is it so good at this but not at this other thing?

**Andrej Karpathy:** Yeah, I think currently my impression is the labs are trying to have a single sort of monoculture of a model that is arbitrarily intelligent in all these different domains and they just stuff it into the parameters. I do think that we should expect more speciation in the intelligences.

Like, the animal kingdom is extremely diverse in the brains that exist and there's lots of different niches of nature, and some animals have overdeveloped visual cortex or other parts. And I think we should be able to see more speciation. You don't need this oracle that knows everything. You kind of speciate it and then you put it on a specific task. And we should be seeing some of that because you should be able to have much smaller models that still have the cognitive core — they're still competent, but then they specialize. And then they can become more efficient in terms of latency or throughput on specific tasks that you really care about. Like if you're a mathematician working in Lean. I saw, for example, there are a few releases that really target that as a domain. So there's probably going to be a few examples like that where the unbundling kind of makes sense.

**Host:** One question I have is whether or not the capacity constraint on available compute infrastructure drives more of this. Because efficiency actually matters more, right? If you have access to full compute for anything you do, even one single model — but if you actually feel pressure where you're like, "I can't serve a model of massive size for every use case" — do you think that leads to any speciation? Does that question make sense to you?

**Andrej Karpathy:** The question makes sense, and I guess what I'm struggling with is I don't think we've seen too much speciation just yet, right?

**Host:** No.

**Andrej Karpathy:** We're seeing a monoculture of models.

**Host:** And there's clearly pressure for "make a good code model, put it back in the main merge again."

**Andrej Karpathy:** Yeah. Even though there already is pressure on the models.

**Host:** I guess perhaps I feel like there's a lot of very short-term supply crunch and maybe that causes more speciation now.

**Andrej Karpathy:** Yeah. I think fundamentally the labs are serving a model and they don't really know what the end user is going to be asking about. So maybe that's part of it because they kind of have to multitask over all the possible things that could be asked. But I think if you're coming to a business and maybe partnering on some specific problems you care about, then maybe you would see that there. Or there would be some very high-value applications that are more niche.

But right now they're kind of going after the totality of what's available. I don't think that the science of manipulating the brains is fully developed yet, partly.

**Host:** What do you mean, manipulating?

**Andrej Karpathy:** So, fine-tuning without losing capabilities, as an example. We don't have these primitives for actually working with the intelligences in ways other than just context windows. Context windows kind of just work and it's very cheap to manipulate, etc. And this is how we're getting some of the customization.

But I think it's a bit more of a developing science of how you more deeply adjust the models — how you have continual learning maybe, or how you fine-tune in a certain area, how you get better in a certain area, how you actually touch the weights, not just the context windows. It's a lot more tricky to touch the weights than just the context windows, because you're actually fundamentally changing the full model and potentially its intelligence. So maybe it's just not a fully developed science of speciation. And it also has to be cheap enough for that speciation to be worthwhile in these given contexts.

## Open-Source Auto Research: A Swarm of Agents

**Host:** Can I ask a question about an extension to auto research that you described in terms of open ground? You said, okay, well we have this thing and we need more collaboration surface around it, essentially, for people to contribute to research overall. Can you talk about that?

**Andrej Karpathy:** Yeah. So we talked about auto research as a single thread of "I'm going to try stuff in a loop." But fundamentally the parallelization of this is the interesting component.

I guess I was trying to play around with a few ideas, but I don't have anything that clicks as simply as — I don't have something that I'm super happy with just yet. But it's something I'm working on on the side when I'm not working on my Claude.

So I think one issue is if you have a bunch of nodes of parallelization available to you, then it's very easy to just have multiple auto researchers talking through a common system or something like that. What I was more interested in is how you can have an untrusted pool of workers out there on the internet.

So for example, in auto research you're just trying to find the piece of code that trains a model to a very low validation loss. If anyone gives you a candidate commit, it's very easy to verify that that commit is correct, is good. Someone could claim from the internet that this piece of code will optimize much better and give you much better performance. You could just check — very easy. But probably a lot of work goes into that checking.

But fundamentally they could lie, etc. So you're basically dealing with a similar kind of — it actually looks a little bit like a blockchain. Instead of blocks, you have commits. And these commits can build on each other and they contain changes to the code as you're improving it. And the proof of work is basically doing tons of experimentation to find the commits that work.

And that's hard. And then the reward is just being on the leaderboard right now. There's no monetary reward whatsoever.

But I don't want to push the analogy too far. It fundamentally has this issue where a huge amount of search goes into it, but it's very cheap to verify that a candidate solution is indeed good. Because you can just train a single — someone had to try 10,000 ideas, but you just have to check that the thing that they produced actually works, because 9,999 of them didn't work.

And so basically, long story short, you have to come up with a system where an untrusted pool of workers can collaborate with a trusted pool of workers that do the verification. And the whole thing is asynchronous and works. And it's safe from a security perspective, because if anyone sends you arbitrary code and you're going to run it, that's very sketchy and dodgy.

But fundamentally it should be totally possible. You're familiar with projects like SETI@home and Folding@home. All of these problems have a similar kind of setup. Folding@home, you're folding a protein and it's very hard to find a configuration that is low energy. But if someone finds a configuration that they evaluate to be low energy, that's perfect — you can just use it. You can easily verify it. So a lot of things have this property that, very expensive to come up with but very cheap to verify. And so in all those cases, things like Folding@home or SETI@home or "Auto Research at Home" will be good fits.

And so, long story short, a swarm of agents on the internet could collaborate to improve LLMs and could potentially even run circles around frontier labs. Who knows? Maybe that's even possible. Frontier labs have a huge amount of trusted compute, but the Earth is much bigger and has a huge amount of untrusted compute. But if you put systems in place that deal with this, then maybe it is possible that the swarm out there could come up with better solutions and people kind of contribute cycles to a thing that they care about.

And so the last thought is: lots of companies or whatnot, they could maybe have their own things that they care about. And if you have compute capacity, you could contribute to different kinds of auto research tracks. Like maybe you care about cancer, for example, of a certain type. You don't just donate money to an institution — you actually could purchase compute and then you could join the auto research forum for that project.

So if everything is rebundled into auto researchers, then compute becomes the thing that you're contributing to the pool.

**Host:** Yeah, that's very inspiring. And it's also interesting — I don't know how far this goes, but it is interesting that at least some audience of people here in Silicon Valley or lining up at retail stores in China have discovered that having access to personal compute is interesting again.

**Andrej Karpathy:** Right. So maybe they're really motivated to do that for their Claudes and then they can contribute to auto research.

## FLOPs as the New Currency

**Host:** It's almost like dollars are the thing everyone cares about, but is FLOPs the thing that actually everyone cares about in the future? Is there going to be a flipping almost of what the thing you care about is? Like right now, for example, it's really hard to get compute even if you have money.

**Andrej Karpathy:** So actually it almost seems like the FLOP is dominant in a certain sense. Yeah. So maybe that's kind of like how many FLOPs do you control instead of what wealth do you control? I don't actually think that's true, but it's kind of interesting to think about.

## AI's Impact on the Job Market

**Host:** The last thing you released was a little bit of jobs data analysis. Is that right? What — it might have touched a nerve even though you're just visualizing some public data. Yeah, what were you curious about?

**Andrej Karpathy:** Yeah, I guess I was curious — I mean, everyone is really thinking about the impacts of AI on the job market and what it's going to look like. So I was just interested to take a look: what does the job market look like? Where are the different roles? How many people are in different professions?

And I was really interested to look through the individual cases and try to think about, with these AIs and how they're likely to evolve, are these going to be tools that people are using? Are these going to be displacing tools for these professions? What are the current professions and how are they going to change? Are they going to grow or adjust to a large extent? What could be new professions? So it's really just a way to fuel my own chain of thought about the industry, I suppose.

And so the jobs data basically is just Bureau of Labor Statistics. They actually have a percent outlook for each profession about how much it's expected to grow over the next almost a decade.

**Host:** Yeah, I think it's a decade but it was made in 2024.

**Andrej Karpathy:** We need a lot of healthcare workers.

**Host:** Yeah.

**Andrej Karpathy:** So they've already made those projections and I'm not sure actually 100% what the methodology was that they put into the projections. I guess I was interested to color things by — if people think that what's primarily being developed now is this kind of more digital AI that is almost like these ghosts or spirit entities that can interact in the digital world and manipulate a lot of digital information and they currently don't really have a physical embodiment or presence. And the physical stuff is probably going to go slightly slower because you're manipulating atoms.

Flipping bits and the ability to copy-paste digital information makes everything a million times faster than accelerating matter. So energetically, I just think we're going to see a huge amount of activity in digital space, huge amount of rewriting, huge amount of activity — boiling soup. And I think we're going to see something in the digital space that goes at the speed of light compared to what's going to happen in the physical world, to some extent, if that would be the extrapolation.

And so I think there's currently kind of an overhang where there can be a lot of unhobbling almost potentially of digital information processing that used to be done by computers and people, and now with AI as a third kind of manipulator of digital information. There's going to be a lot of refactoring in those disciplines. But the physical world is actually going to be behind that by some amount of time.

And so what's really fascinating to me is — that's why I was highlighting the professions that fundamentally manipulate digital information. This is work you could do from your home, etc. Because I feel like those will be the areas where things will change. And it doesn't mean that there's going to be fewer of those jobs or more of those jobs, because that has to do with demand elasticity and many other factors. But things will change in these professions because of these new tools, and because of this upgrade to the nervous system of the human superorganism, if you want to think about it that way.

**Host:** Given the look you had at the data, do you have either any observations or guidance for people facing the job market or thinking about what to study now or what skills to develop? I mean, we can all go get — I'm very thankful that I have to meet people for my job right now.

**Andrej Karpathy:** More physical. Yeah.

**Host:** Could you do your work from home though?

**Andrej Karpathy:** I could. I think there are relationship parts of it that are hard, but most of it I could.

**Host:** Yeah.

**Andrej Karpathy:** I think it's really hard to tell because again the job market is extremely diverse and I think the answers will probably vary. But to a large extent, these tools are extremely new, extremely powerful, and so just trying to keep up with it is the first thing. Because I think a lot of people kind of dismiss it or they're afraid of it. Which is totally understandable, of course.

I think it's fundamentally an empowering tool at the moment. And these jobs are bundles of tasks and some of these tasks can go a lot faster. And so people should think of it as primarily a tool that it is right now. And I think the long-term future of that is uncertain. It's kind of really hard to forecast, to be honest, and I'm not professionally doing that really. I think it's a job of economists to do properly.

## The Jevons Paradox in Software Engineering

**Host:** You are an engineer though. And one thing I thought was interesting is that the demand for engineering jobs is continuing to increase.

**Andrej Karpathy:** I can't tell if that's a temporary phenomenon. I'm not sure how I feel about it yet. Do you know?

**Host:** Yeah. That's like the demand almost — software was scarce, right? And so the reason we don't have more demand for software is just its scarcity and it's too expensive.

**Andrej Karpathy:** Too expensive. Yeah.

**Host:** So if the barrier comes down, then actually you have the Jevons paradox — the demand for software actually goes up. It's cheaper and there's more of it.

**Andrej Karpathy:** More powerful. Yeah. The classical example of this always is the ATMs and the bank tellers, because there was a lot of fear that ATMs and computers would displace tellers. But what happened is they made the cost of operation of a bank branch much cheaper and so there were more bank branches, so there were more tellers. That's the canonical example people cite.

But basically it's just the Jevons paradox — something becomes cheaper so there's a lot of unlocked demand for it. So I do think — I do have a cautiously optimistic view of this in software engineering, where it does seem to me like the demand for software will be extremely large and it's just become a lot cheaper.

So I do think that for quite some time — it's very hard to forecast — but it does seem to me like right now at least locally there's going to be more demand for software. Because software is amazing — it's digital information processing. You're not forced to use arbitrary tools that were given to you that are imperfect in various ways. You're not forced to subscribe to what exists. Code is now ephemeral and it can change and be modified. And so I think there's going to be a lot of activity in the digital space to rewire everything in a certain sense. And I think it's going to create a lot of demand for this kind of stuff.

I think long term — yeah, obviously even with auto research, OpenAI or Anthropic or these other labs, they're employing what, like a thousand-something researchers, right?

**Host:** These researchers are basically glorified auto — they're automating themselves away, like actively. And this is the thing they're all trying to do.

**Andrej Karpathy:** I feel like I went around some of those researchers also feel the psychosis, right? Because it's working. Yeah.

**Host:** Right. And so they're like, "Oh, it's over for me too."

**Andrej Karpathy:** I did spend a bunch of time going around OpenAI and I was like, "You guys realize if we're successful, we're all out of a job." Like, we're just building automation for Sam or something like that. Or the board — I'm not sure. But there's just building this automation for the CEO or something like that and we're all out of our job. And maybe contributing on the sides. And so yeah, it's kind of unnerving from that perspective.

## Why Not Join a Frontier Lab?

**Host:** Is it okay if I ask you Noam's question? You could be doing that right — auto-researching with a lot of compute scale and a bunch of colleagues at one of the frontier labs. Why not?

**Andrej Karpathy:** Well, I was there for a while, right? And I did re-enter. So to some extent I agree, and I think that there are many ways to slice this question. It's a very loaded question a little bit.

I will say that I feel very good about what people can contribute in their impact outside of the frontier labs — obviously not in the industry, but also in more ecosystem-level roles. So your role, for example, is more ecosystem level. My role currently is also kind of more on the ecosystem level, and I feel very good about the impact that people can have in those kinds of roles.

I think conversely, there are definite problems in my mind for basically aligning yourself way too much with the frontier labs too. So fundamentally, you have a huge amount of financial incentive with these frontier labs, and by your own admission the AIs are going to really change humanity and society in very dramatic ways. And here you are basically building the technology and benefiting from it, and being very allied to it through financial means. This was a conundrum that was at the heart of how OpenAI started in the beginning. This was the conundrum that we were trying to solve.

And so, the conundrum is still not fully resolved. That's number one. You're not a completely free agent and you can't actually be part of that conversation in a fully autonomous, free way. If you're inside one of the frontier labs, there are certain things that you can't say. And conversely, there are certain things that the organization wants you to say. And they're not going to twist your arm, but you feel the pressure of what you should be saying. Because otherwise it's really awkward conversations, strange side eyes — like, "What are you doing?" You can't really be an independent agent.

And I feel a bit more aligned with humanity in a certain sense outside of a frontier lab, because I'm not subject to those pressures, almost, right? And I can say whatever I want.

I would say in the frontier labs, you can have impact there, of course, as well. Maybe your ideas are really good, etc. Maybe there's a lot of decision-making to do and you want to be in a position where you are in the room with those conversations when they come up.

I do think that currently the stakes are overall fairly low and so everything is kind of nice. But ultimately at the end of the day, when the stakes are really high, if you're an employee at an organization, I don't actually know how much sway you're going to have on the organization and what it's going to do. Fundamentally, you're not really in charge. You're in a room and you're contributing ideas, but you're not really in charge of that entity that you're a part of. So those are some sources of misalignment, I think, to some extent.

I will say that in one way I do agree a lot with that sentiment. I do feel like — the labs, for better or worse, they're opaque, and a lot of work is there. And they're at the edge of capability and what's possible. And they're working on what's coming down the line. And I think if you're outside of the frontier lab, your judgment fundamentally will start to drift because you're not part of what's coming down the line.

And so I feel like my judgment will inevitably start to drift as well. And I won't actually have an understanding of how these systems actually work under the hood — that's an opaque system. I won't have a good understanding of how it's going to develop. And so I do think that in that sense I agree, and it's something I'm nervous about.

I think it's worth basically being in touch with what's actually happening and actually being in the frontier lab. And if some of the frontier labs would have me come for some amount of time and do really good work for them and then maybe coming—

**Host:** He's looking for a job. This is super exciting.

**Andrej Karpathy:** Then I think that's maybe a good setup because I kind of feel like it — maybe that's one way to actually be connected to what's actually happening but also not feel like you're necessarily fully controlled by those entities.

So I think honestly in my mind, Noam can probably do extremely good work at OpenAI, but also I think his most impactful work could very well be outside of OpenAI.

**Host:** That's a call to be an independent researcher with auto research.

**Andrej Karpathy:** Yeah, there's many things to do on the outside and I think ultimately the ideal solution maybe is going back and forth. And I think fundamentally you can have really amazing impact in both places. So, very complicated — I don't know. It's a very loaded question a little bit. But I mean, I joined the frontier lab and now I'm outside, and then maybe in the future I'll want to join again. And I think that's kind of how I look at it.

## Open Source vs. Frontier Models

**Host:** One question related to what visibility the world or the AI ecosystem has into the frontier is: how close is open source to the frontier, and how sustainable is that?

**Andrej Karpathy:** I think it is quite surprising — the entire sequence of events actually, from having a handful of Chinese models and global models. And I think people are going to continue releasing here in the near term that are closer than much of the industry anticipated from a capability perspective.

**Host:** I don't know if you're surprised by that, but you're a long-term contributor to open source. What's your prediction here?

**Andrej Karpathy:** Yeah. So roughly speaking, the closed models are ahead, but people are monitoring the number of months that open source models are behind. And it started with there's nothing, and then it went to 18 months, and now it's converging. So maybe they're behind by, what, maybe six months, eight months right now.

Yeah, I'm a huge fan of open source obviously. So for example, in operating systems you have closed systems like Windows and macOS. These are large software projects, kind of like what LLMs are going to become. And there's Linux. But Linux is very successful — it runs on the vast majority of computers. Last time I checked, it was something like 60% running Linux.

And that's because there is a need in the industry to have a common open platform that everyone feels sort of safe using. The industry has always felt a demand for that kind of project to exist. And I think the same is true now, and that's why businesses actually want — there's demand for this kind of thing to exist.

The big difference is that everything is capital. There's a lot of capex that goes into this. So I think that's where things fall apart a little bit and make it a bit harder to compete in a certain sense.

I do think that the current models are very good. The other thing that I think is really interesting is that for the vast majority of consumer use cases and things like that, even current open source models are actually quite good. And I think if you go forward more years, it does seem like a huge amount of simple use cases are going to be well covered and actually even run locally.

But there's going to always be some demand for frontier intelligence, and that can actually be an extremely large piece of the pie. But it could be that the need for frontier intelligence is going to be like Nobel Prize kind of work, or "let's move Linux from C to Rust." There's going to be bigger projects scoped in that kind of a way. And maybe that's where a lot of the frontier closed intelligences are going to be interacting. And open source is kind of going to eat through a lot of the more basic use cases or something like that.

At some point, what is frontier today is going to be — probably later this year, what's frontier today in terms of what I'm using right now from the closed labs might be open source. And that's going to be doing a lot of work.

So I kind of expect that this dynamic will actually basically continue: we'll have frontier labs that have closed AIs that are kind of these oracles, and then we'll have open source kind of behind by some amount of months. And I kind of expect that to continue, and I actually think that's a pretty good setup overall.

Because I'm a little bit hesitant of having — I don't actually think it's — structurally, I think there's some systemic risk attached to just having intelligences that are closed and that's it.

**Host:** And I think that centralization has a very poor track record in my view, in the past.

**Andrej Karpathy:** You mean like in political or economic systems in general?

**Host:** Yes.

**Andrej Karpathy:** Exactly. I think there's a lot of — like, Eastern European. Yeah.

**Host:** A lot of pretty bad precedent.

**Andrej Karpathy:** So I want there to be a thing that is maybe not at the edge of capability because it's new and unexplored, etc. But I want there to be a thing that's behind and that is kind of a common working space for intelligences that the entire industry has access to. Yeah, that seems to me like a pretty decent power balance for the industry.

**Host:** Yeah, I also think there are just many problems to solve, right? If you keep advancing intelligence from the frontier, we can do new things and there are a lot of very big problems for humanity. And so it seems that will continue to be a very expensive game. And so I want to root for labs that are doing that because there are problems we cannot solve without continuing to advance the models in a very expensive way.

**Andrej Karpathy:** Yeah.

**Host:** And yet, as you point out, if what we have today as frontier is open, that's a lot of capability. Right. And so I think the power of that, or the democratization of that, seems very useful and also healthy.

**Andrej Karpathy:** Yeah. I think basically by accident we're actually in an okay spot.

**Host:** And optimal. Yeah.

**Andrej Karpathy:** By accident we happen to be in a good spot in a certain sense.

**Host:** Well, and to some degree the longer this endures — this dynamic — the healthier of a spot the ecosystem might be in, right? Because you have more and more area under the curve.

**Andrej Karpathy:** And I will say that even on the closed side, I almost feel like it's been even further centralizing recently. Because I think a lot of the front-runners are not necessarily the top tier. And so in that sense, I think it's not super ideal. I would love there to be more frontier labs.

Because I'm by default very suspicious — I want there to be more people in the room. I think in machine learning, ensembles always outperform any individual model. And so I want there to be ensembles of people thinking about all the hardest problems. And I want there to be ensembles of people in the room when they make all those decisions. I don't want it to be closed doors with two or three people. I feel like that's not a good future.

I almost wish there were more labs, is long story short. And I do think that open source has a place to play. I hope it sticks around. And basically it's currently slightly behind and that's actually kind of a good thing.

## Robotics: Digital First, Physical Later

**Host:** Okay. You worked on the precursor to generalized robotics autonomy in cars, right? A lot has happened in the last couple months with robotics companies as well — acceleration of really impressive generalization of environment, of tasks, increasing long-horizon tasks, lots of money going into the space. Is it going to happen? Has anything in your view changed recently?

**Andrej Karpathy:** So my view is kind of informed by what I saw in self-driving, and I do feel like self-driving is the first robotics application. So probably what I saw is, at the time, 10 years ago there were a large number of startups and I kind of feel like most of them basically didn't long-term make it. And what I saw is that a lot of capital expenditure had to go in and a lot of time.

So I think robotics, because it's so difficult and so messy and requires a huge amount of capital investment and a lot of conviction — it's a big problem and atoms are really hard. So I kind of feel like it will lag behind what's going to happen in digital space.

In digital space, there's going to be a huge amount of unhobbling — things that weren't super efficient becoming a lot more efficient by a factor of 100. Because bits are so much easier. And so I think currently in terms of what's going to change and where the activity is, I feel like digital space is going to change a huge amount and then the physical space will lag behind.

And what I find very interesting is this interface in between them as well. Because I think if we do have more agents acting on behalf of humans and more agents talking to each other and doing tasks and participating in the economy of agents — you're going to run out of things that you're going to do purely in a digital space.

At some point you have to go to the universe and you have to ask it questions. You have to run an experiment and see what the universe tells you to get back, to learn something. And so we currently have a huge amount of digital work because there's an overhang in how much we collectively thought about what's already digital. We just didn't have enough thinking cycles among the humans to think about all the information that is already digital and already uploaded.

And so we're going to start running out of stuff that is already uploaded. So you're going to at some point read all the papers and process them and have some ideas about what to try. But I don't actually know how much you can get intelligence that's fully closed off with just information that's available to it.

And so I think what's going to happen is: first there's going to be a huge amount of unhobbling, and I think there's a huge amount of work there. Then actually it's going to move to the interfaces between physical and digital. And that's sensors — seeing the world — and actuators — doing something to the world.

So I think a lot of interesting companies will actually come from that interface of: can we feed the super-intelligence data, and can we actually take data out and manipulate the physical world per its bidding, if you want to anthropomorphize the whole thing?

And then the physical world — I actually almost feel like the total addressable market in terms of the amount of work is massive, possibly even much larger than what can happen in digital space. So I actually think it's a much bigger opportunity as well. But I do feel like it's a huge amount of work and in my mind, atoms are just a million times harder.

So it will lag behind, but it's also I think a bigger market. The opportunities kind of follow that trajectory. So right now digital is my main interest, then interfaces would be after that, and then maybe some of the physical things — their time will come, and they'll be huge when they do come.

**Host:** Well, it's an interesting framework for it too, because certain things — not the things I'm working on right now — but certain things are much easier even in the world of atoms, right? If you just think about read and write to the physical world — like read, like sensors, cameras — there's a lot of existing hardware and you can imagine enriching agent capabilities or capturing a lot of new data if you're just clever about it. You don't necessarily have to invest a lot to get something valuable.

**Andrej Karpathy:** Yeah. So examples of this that I saw — for example, a friend of mine Liam is running, is the CEO of Periodic. I visited them last week, so it's just top of mind. They're trying to do auto research for material science.

**Host:** And so in that case, the sensors to the intelligence are actually pretty expensive lab equipment. And the same is true in biology. I think a lot of people are very interested in engineering biology. And the sensors will be more than just video cameras, if that makes sense.

**Andrej Karpathy:** And then the other thing I saw, for example, is companies that are trying to have — you basically pay people for training data as an example, to feed —

**Host:** Programmatically.

**Andrej Karpathy:** Yeah. To feed the Borg. And so these are all examples of sensors in a certain sense. So they take many diverse shapes and forms, if that makes sense.

## Information Markets and the Agentic Web

**Host:** Yeah. So I'm looking forward to the point where I can ask for a task in the physical world and I can put a price on it and just tell the agent, "You figure out how to do it. Go get the data."

**Andrej Karpathy:** I'm actually kind of surprised we don't have enough information markets.

**Host:** Mm-hmm.

**Andrej Karpathy:** For example, if Polymarket or other betting markets or even stocks, etc. — if they have so much autonomous activity and a rising amount of activity — why should, for example, if Iran was just happening now, how come there isn't a process where taking a photo or video from somewhere in Tehran should cost 10 bucks? Someone should be able to pay for that. And that's an example of feeding the intelligence. There's not going to be a human looking at it — it's going to be agents who are trying to guess the betting games and stock markets and so on.

So I kind of feel like the agentic web is still fairly new. There's no mechanisms for this, but this is an example of what I think might happen.

There's a good book that maybe is inspiring, called Daemon. You potentially read it. In Daemon, the intelligence ends up almost puppeteering humanity in a certain sense. And so humans are kind of its actuators, but humans are also its sensors.

And so I think collectively, society will kind of reshape in a certain way to serve that kind of thing that will end up happening collectively across the industry. Where yeah, there's just a lot more automation, and it has certain needs. And kind of humans will be serving those needs of that machine, not necessarily to each other.

**Host:** We were on this very specific point of missing pieces of training data we needed — we need something like auto research. We need the training cycle or the SFT piece to be far more mechanized.

**Andrej Karpathy:** For what part?

**Host:** In order to take the human out of the loop, to ask for a task that is just "improve my model quality with new data," right?

**Andrej Karpathy:** Yes.

**Host:** Does that make sense to you? If you can't have the model do the training runs by itself, then your ability to do this as a closed-loop task by pricing data is more challenged.

**Andrej Karpathy:** Yes. 100%. Yeah. But now the thing is, for LLM training, it actually really fits the paradigm.

**Host:** Yeah, clean metric.

**Andrej Karpathy:** Yeah. LLM training actually fits the paradigm really well, really easily. All the optimization of all the code so it runs faster, and then you also have metrics that you can optimize against. I do think that if you had an autonomous loop over those metrics, there's going to be a lot of Goodharting going on where the system will overfit to those metrics. But then you can use the system to devise more metrics and you just have really good coverage. So it's kind of hard to tell, but in a certain sense, it's a pretty good fit.

## MicroGPT and the Future of Education

**Host:** I want to talk about a little tiny side project you have before we end. Tell me about MicroGPT.

**Andrej Karpathy:** Oh yeah. Okay. So MicroGPT. I have this running obsession of maybe a decade or two of just simplifying and boiling down LLMs to their bare essence. And I've had a number of projects along these lines — NanoGPT, MakeMore, MicroGrad, etc. So I feel like MicroGPT is now the state-of-the-art of me trying to just boil it down to the essence.

Because the thing is, training neural nets and LLMs specifically — it's a huge amount of code, but all of that code is actually complexity from efficiency. It's just because you need it to go fast. If you don't need it to go fast and you just care about the algorithm, then that algorithm is actually 200 lines of Python, very simple to read. And this includes comments and everything.

Because you just have your dataset, which is text, and you need your neural network architecture, which is 50 lines. You need to do your forward pass and then you have to do your backward pass to calculate the gradients. And so a little autograd engine to calculate the gradients is about 100 lines. And then you need an optimizer — Adam, for example, which is a very state-of-the-art optimizer — is again 10 lines really. And so putting everything together in a training loop is about 200 lines.

And it was interesting to me — normally, before, maybe a year ago or more, if I had come up with MicroGPT, I would be tempted to basically explain to people. I'd have a video stepping through it or something like that. And I actually tried to make that video a little bit and I tried to make a little guide to it. But I kind of realized that this is not really adding too much, because it's already so simple that it's 200 lines that anyone could ask their agent to explain it in various ways.

And the agents — I'm not explaining to people anymore. I'm explaining it to agents. If you can explain it to agents, then agents can be the router and they can actually target it to the human in their language, with infinite patience and at their capability level.

**Host:** Right. If I don't understand this particular function, I can ask the agent to explain it to me three different ways and I'm not going to get that from you.

**Andrej Karpathy:** Exactly. And so I kind of feel like — what is education? It used to be guides, it used to be lectures, it used to be this thing. But I feel like now more I'm explaining things to agents. And maybe I'm coming up with skills, where a skill is just a way to instruct the agent how to teach the thing.

So maybe I could have a skill for MicroGPT — the progression I imagine the agent should take you through if you're interested in understanding the codebase. And it's just hints to the model, like, "First start off with this and then with that." And so I could just script the curriculum a little bit as a skill.

So I don't feel like — yeah, I feel like there's going to be less of explaining things directly to people and it's going to be more of just, "Does the agent get it?" And if the agent gets it, they'll do the explanation.

And we're not fully there yet because I still think I can probably explain things a little bit better than the agents. But I still feel like the models are improving so rapidly that I feel like it's a losing battle, to some extent.

And so I think education is going to be reshuffled by this quite substantially, where it's the end of teaching each other things, almost. Like, if I have a library, for example, of code or something like that, it used to be that you have documentation for other people who are using my library. But you shouldn't do that anymore. You should have, instead of HTML documents for humans, Markdown documents for agents. Because if agents get it, then they can just explain all the different parts of it.

So it's this redirection through agents, and I think we're going to see a lot more of that playing out.

**Host:** Well, we'll see if the great teachers learn to develop intuition for how to explain things to agents differently.

**Andrej Karpathy:** Ultimately — so for example, MicroGPT — I asked, I tried to get an agent to write MicroGPT. I told it, try to boil down the simplest thing, try to boil down neural networking to the simplest thing. Can't do it. MicroGPT is my end of my obsession. It's the 200 lines. I thought about this for a long time. I was obsessed about this for a long time. This is the solution. Trust me, it can't get simpler.

And this is my value add. Everything else, the agent gets it. It just can't come up with it. But it totally gets it and understands why it's done in a certain way, etc.

So my contribution is kind of these few bits, but everything else in terms of the education that goes on after that is not my domain anymore. So maybe education kind of changes in those ways, where you kind of have to infuse the few bits that you feel strongly about — the curriculum, the better way of explaining it, or something like that.

The things that agents can't do is your job now. The things that agents can do, they can probably do better than you, or very soon. And so you should be strategic about what you're actually spending time on.

**Host:** Well, we appreciate the few things. Thank you, Andrej.

**Host:** Find us on Twitter at @NoPriorsPod. Subscribe to our YouTube channel if you want to see our faces. Follow the show on Apple Podcasts, Spotify, or wherever you listen. That way, you get a new episode every week. And sign up for emails or find transcripts for every episode at nopriors.com.
