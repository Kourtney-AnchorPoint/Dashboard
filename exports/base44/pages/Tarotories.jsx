import { useState, useEffect } from "react";
import { createClient } from "@base44/sdk";

const base44 = createClient({ appId: "69dabcfbdff2d23eb6ddb562" });

// ─── INNER CIRCLE PALETTE (distinct from public app) ────────────────────────
const B = {
  bg:"#06040A",       // deeper, warmer dark
  card:"#100C1A",     // rich aubergine-dark
  border:"#2a1f3d",   // warm purple border
  gold:"#C9952A",     // primary gold accent
  amber:"#E8651A",    // ember/fire secondary
  rose:"#D4159A",     // kept from original — portal pink
  pur:"#5c3d9e",      // deeper purple
  cyn:"#10D8F0",      // kept — cosmic cyan
  text:"#f0eaf8",     // warm white
  muted:"#7a6e8a",    // warm muted
};

const CARD_BACK = "https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/729de3a81_generated_image.png";

const DECK = [
  { id:0,  name:"The Fool",          theme:"Leap of Faith · New Beginnings · Zero Point", img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e87c2dad0_generated_image.png", message:"You are standing at the edge of the unknown, and the unknown is exactly where your story begins. The Fool doesn't wait for a sign, a plan, or permission — the Fool understands that the leap IS the sign. Right now you are being asked to trust something you can't yet see, to believe in something that doesn't have proof yet, to move even when the ground feels unsteady. This is not recklessness — this is faith. The version of you that keeps waiting for the perfect moment is quietly stealing the life you're supposed to be living. There will always be a reason not to go. There will always be a safer path. But the Fool knows something that the careful, cautious mind doesn't: the net appears when you jump. Not before. The universe doesn't fund preparation — it funds motion. Whatever you've been circling, whatever dream you keep talking yourself out of, whatever bold move you've been postponing until conditions are 'right' — the card is saying: now. Not tomorrow. Not when you feel ready. Now.", action:"Identify the one move you've been postponing because you're not 'ready.' Take the first physical step today — even if it's tiny.", affirmation:"I move before I'm ready. I trust the net to appear." },
  { id:1,  name:"The Magician",      theme:"Power · Manifestation · You Have What You Need", img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e87c2dad0_generated_image.png", message:"Every single tool you need is already on the table in front of you. The Magician doesn't wait for more resources, more time, more experience, more connections — the Magician looks at what's already there and asks: what can I build with this? That is what you're being called to do right now. Stop scanning the horizon for what's missing and start looking at what you already hold. You have skills other people would pay for. You have wisdom earned through experiences that broke and rebuilt you. You have a mind that can see connections others miss and a vision that is genuinely yours. The Magician is the card of the self-made. Of the person who refused to be defined by their starting conditions. Of the builder who sees potential where others see limitation. The only gap between where you are and where you want to be is your willingness to fully use what you already have. No more waiting to feel worthy. No more holding back until you're more prepared. You are the one you've been waiting for.", action:"Write down every skill, resource, and connection you already have. Then ask: what could I build today with just this?", affirmation:"Everything I need is already in my hands. I am the resource I've been looking for." },
  { id:2,  name:"The High Priestess",theme:"Intuition · Sacred Knowing · Inner Oracle", img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/a89f558e9_generated_image.png", message:"You already know the answer. You've known it for a while now. You came to the cards hoping for confirmation, maybe hoping they'd tell you something different, something easier — but the High Priestess doesn't lie. She holds the scroll of what you already know in your bones and asks: when are you going to stop pretending you don't know? That whisper in your gut that gets louder when you ignore it — that's not anxiety, that's truth. The sensation in your chest when someone says the thing that's wrong — that's not oversensitivity, that's your inner compass doing exactly what it was designed to do. You have been trained by the world to distrust your own knowing. To outsource your discernment to people who don't live in your body, in your life, in your specific situation. The High Priestess is the end of that. She is the reclamation of your right to trust yourself. Stop waiting for someone smarter, more credentialed, or more confident to tell you what you already feel. You are your own oracle. Go inward.", action:"Sit in silence for 10 minutes with your question. Write down the very first answer that comes — before the mind edits it.", affirmation:"I trust what I already know. My inner voice is the clearest signal I have." },
  { id:3,  name:"The Empress",       theme:"Abundance · Creation · Bloom Into It",    img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e87c2dad0_generated_image.png", message:"You are in a season where the seeds you've planted are ready to break through the surface — if you let them. The Empress is the card of creation in its most natural, abundant form. She doesn't force growth. She creates the conditions for it: warmth, nourishment, patience, presence. Where in your life have you been trying to force something instead of tending it? Where have you been starving yourself of the very things that allow you to create — rest, beauty, pleasure, connection? The Empress also carries a message about receiving. You have been so focused on giving, building, producing — and you have forgotten that abundance flows both ways. You are allowed to receive love, support, help, money, recognition without immediately performing gratitude or giving it back. Receiving is not weakness. Receiving is what allows you to keep giving without burning down. This card is also a direct invitation to create. Not perfectly. Not with a plan. Just begin. Let the thing that wants to come through you, come through.", action:"Tend to the one thing you've been neglecting that, if nurtured, could grow into something life-changing.", affirmation:"I am in a season of creation. I give and receive in equal measure. I bloom." },
  { id:4,  name:"The Emperor",       theme:"Structure · Authority · Build the Foundation", img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e87c2dad0_generated_image.png", message:"The vision you carry is real. But a vision without structure is just a dream — and you've been dreaming long enough. The Emperor calls you to build. To move from inspiration into architecture, from feeling into form, from wanting into doing with discipline. This isn't about becoming rigid or losing your spark — it's about giving your spark something solid to burn within. The most creative, passionate, free people in the world are also deeply disciplined. They show up when they don't feel like it. They build the systems that protect their energy. They set the boundaries that keep them from being consumed. That's what this card is asking of you now. What structure, if you built it and held it, would change everything? A morning routine you actually keep. A financial system that isn't pure chaos. A work boundary that protects your deepest hours. The Emperor doesn't succeed because of talent alone — he succeeds because he builds something that holds. Your talent already exists. Now build the container.", action:"Identify the one structure — a boundary, a routine, a system, a plan — that would have the highest impact on your life. Build it today.", affirmation:"I build what I want to live inside. Structure is not a cage — it is how I protect my freedom." },
  { id:5,  name:"The Hierophant",    theme:"Tradition · Question the Script · Choose Your Own Doctrine", img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e87c2dad0_generated_image.png", message:"Who handed you the beliefs you're living by? Somewhere along the way, someone told you what success looks like, what love is supposed to feel like, what you're allowed to want, what kind of person you're supposed to be — and a younger version of you accepted it without question because that's what kids do. But you're not a kid anymore. The Hierophant is the card that asks you to audit your inner rulebook with ruthless honesty. Not to throw everything out — there is real wisdom in tradition, in the accumulated knowledge of those who came before. But there are also chains disguised as wisdom. Rules that were built for someone else's life, someone else's era, someone else's fear. The question isn't whether to follow rules — it's whether the rules you're following actually align with who you are and what you believe, or whether you've simply never stopped to ask. What do you actually think? What do you actually believe about God, love, money, worthiness, what's possible? Not what you were taught. What do YOU know to be true?", action:"Write down three beliefs you've been operating from. For each one, ask: did I choose this, or was it chosen for me? Keep only what is truly yours.", affirmation:"I question everything. I keep only what I have chosen. My doctrine is my own." },
  { id:6,  name:"The Lovers",        theme:"Choice · Alignment · The Values Test",    img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e87c2dad0_generated_image.png", message:"There is a choice in front of you, and it is more significant than it might appear on the surface. The Lovers is not simply the card of romance — it is the card of alignment, of what it truly means to choose. Every real choice is a values declaration. When you choose this path over that one, you are saying something about who you are, what matters most to you, what kind of life you are building. So what are you actually choosing right now? Not what looks responsible, not what keeps the peace, not what would disappoint people the least — but what do YOU want? The Lovers appears when the universe needs you to be honest with yourself about what you're choosing and why. Are you staying somewhere because you want to, or because you're afraid to leave? Are you pursuing something because it lights you up, or because it looks impressive from the outside? Are you in alignment — does your outer life actually reflect your inner values? The deepest kind of love, whether for a person, a path, or a version of yourself, requires that kind of honesty. Choose with your whole self. Not just your head.", action:"Name the choice you've been avoiding or making for the wrong reasons. Say out loud what you actually want. Then move toward it.", affirmation:"I choose what I want, not what I think I'm supposed to want. My choices are my truth." },
  { id:7,  name:"The Chariot",       theme:"Victory · Drive · You Are Going to Win",  img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e87c2dad0_generated_image.png", message:"You are moving. Maybe not at the speed you want, maybe not in the way you imagined, maybe with more resistance than you feel equipped to handle — but you are in motion, and that matters more than you know. The Chariot doesn't promise a smooth road. It promises victory to the one who doesn't stop. The opposition you're facing right now — the doubt, the setbacks, the people who don't believe in it, the circumstances that keep shifting — this is not a sign that you're on the wrong path. This is the resistance that tests whether you actually want what you say you want. The Chariot teaches that will is a muscle. Every time you show up when you don't feel like it, every time you push through the wall instead of turning around, every time you choose the harder right thing over the easier wrong one — you are building the kind of character that actually wins. Don't let someone else's doubt become your steering wheel. Don't let a hard week become a reason to abandon a years-long dream. You are closer than you think. The moment you feel most like quitting is almost always three feet from the breakthrough.", action:"Identify where you've been slowing down or considering stopping. Double down there. That's where the breakthrough is.", affirmation:"I am in motion. I do not stop now. Victory belongs to the ones who keep going." },
  { id:8,  name:"Strength",          theme:"Quiet Power · Courage · The Lion Inside You", img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/a89f558e9_generated_image.png", message:"The strength this card is pointing to isn't loud. It doesn't need an audience. It doesn't announce itself or perform for approval. It's the kind of strength that gets up after being knocked flat without making a speech about it — that keeps going when no one is watching, that holds its center in rooms that try to rattle it, that stays soft even after being hardened by things that would have broken someone else. You have more of this than you give yourself credit for. Think about what you've already survived. Think about the versions of yourself that had every reason to stop and didn't. That quiet, persistent, unspectacular courage you've been showing up with every day — that is strength in its purest form. The Strength card also carries a message about how you relate to the harder parts of yourself — the fear, the rage, the grief, the shadow. Real strength doesn't suppress those things. It holds them. It says: I see you, I feel you, and I am bigger than you. You don't need to conquer your darkness. You need to stop being afraid of it.", action:"Identify the one thing you've been avoiding because it feels too big. Do one small thing toward it today. That is strength.", affirmation:"My strength doesn't need to be loud to be real. I carry more power than I show." },
  { id:9,  name:"The Hermit",        theme:"Solitude · Inner Work · The Lantern Within", img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/a89f558e9_generated_image.png", message:"The noise needs to stop for a while. Not forever — just long enough for you to hear yourself again. The Hermit appears when you have been so immersed in the external world — in other people's opinions, in content, in obligations, in the performance of being okay — that you've lost the thread back to yourself. The guidance you've been searching for outside yourself isn't out there right now. It never was. The lantern the Hermit carries doesn't light the whole road — just the next step. That's all you need. One step, illuminated by your own inner knowing, is worth more than a thousand steps taken in the direction someone else pointed. This card is permission to withdraw. To say no to what drains you. To cancel plans. To stop performing. To be alone without feeling like you're failing at something. Solitude is not loneliness — it is the sacred space where you remember who you actually are when nobody is watching. When was the last time you sat with yourself in real quiet? Not scrolling, not consuming, not filling the silence — just present with your own thoughts, your own breath, your own knowing?", action:"Block off real, unscheduled alone time this week. No phone. No noise. Just you and whatever comes up in the silence.", affirmation:"The answers I need live in my own silence. I am my own lantern." },
  { id:10, name:"Wheel of Fortune",  theme:"Cycles · Divine Timing · The Turn Is Already In Motion", img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e7496bf6a_generated_image.png", message:"Everything — every single thing — moves in cycles. The hard season you're in right now is not permanent. It is part of a turning that is larger than any single moment in your life, larger than this week, this year, this chapter. The wheel has never stopped turning for anyone. Not for people who seemed to have it worse than you, not for people who seemed to have it better. The wheel turns for everyone. And right now, if things have been heavy — if the waiting has been long and the progress has felt invisible — the card is telling you that the turn is already in motion. You may not feel it yet. The shift often happens below the surface before it shows up in your visible life. This card also asks you to examine your relationship with control. How much of your suffering right now comes from fighting what you cannot change, from trying to manage outcomes that are genuinely not yours to manage? The Wheel of Fortune is the universe's reminder that timing is not your department. Your only job is to keep showing up, to keep doing your part, and to trust that the cycles you cannot see are working in your favor.", action:"Write down three things you've been trying to control that aren't actually in your control. Release them. Your job is the next right action — not the outcome.", affirmation:"Everything is in motion, including my situation. The turn is coming and I trust it." },
  { id:11, name:"Justice",           theme:"Truth · Accountability · Alignment",       img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e7496bf6a_generated_image.png", message:"Truth has a weight to it. You can feel it in your body when something is off — a subtle tightening, a low-level hum of wrongness that you've learned to push down and ignore. Justice is the card that says: you can stop ignoring it now. The scales will balance. Not always on your timeline, not always in the way you imagine — but the universe has a long memory and a precise hand. If you've been wronged, that is being accounted for. If you've been the one causing harm — even unconsciously, even with good intentions — that is also being accounted for. Justice doesn't punish with cruelty. It simply restores balance. The more important question this card asks is about your own alignment. Are you living in integrity? Does how you spend your time reflect what you say you value? Does how you treat people match who you say you are? Are there truths you've been avoiding because facing them would require you to change something? The truth you're running from is almost never as devastating as you fear. Most of the time, it is the very thing that sets you free.", action:"Identify the truth you've been sidestepping — about yourself, about a situation, about what needs to change. Face it directly today.", affirmation:"I live in alignment. I do not shrink from truth. What is real always wins." },
  { id:12, name:"The Hanged One",    theme:"Surrender · Sacred Pause · The View From Stillness", img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e7496bf6a_generated_image.png", message:"What you've been trying to force is not going to move by force. The Hanged One is one of the most misunderstood cards in the deck because it looks like defeat — suspended, waiting, not moving forward. But the figure in this card is not stuck. They chose to hang. They understand something that the urgent, striving, achieving mind can't access: sometimes the most powerful thing you can do is nothing. The perspective that comes from complete stillness — from surrendering the timeline, releasing the grip, stopping the frantic searching for answers — is a perspective that can only come from this place. Right now you are being called to stop. Not because you've failed, not because your dream is over, not because you need to give up. But because the answer you're looking for cannot be found in motion. It lives in the pause. What are you so afraid will happen if you stop trying to control this for a moment? What if the very thing you're pushing against so hard is actually working itself out on a timeline that requires you to step back and trust?", action:"Identify the situation you've been forcing. Consciously release it for 24 hours. Do nothing about it. Notice what shifts.", affirmation:"My pause is not my failure. It is my pivot. Stillness is its own kind of power." },
  { id:13, name:"Death",             theme:"Transformation · Sacred Endings · What You're Becoming", img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e7496bf6a_generated_image.png", message:"This card has nothing to do with dying and everything to do with becoming. Death in the tarot is the great transformer — the force that ends what is no longer serving you so that something truer, something more aligned with who you are becoming, can take its place. You cannot hold onto the old version of yourself and step into the new one at the same time. Both hands cannot carry both things. The grief you might be feeling right now — about a chapter closing, a relationship ending, an identity being shed — is real and it is valid. The Death card does not ask you to pretend that endings don't hurt. It asks you to trust that this particular ending is not a loss. It is a liberation dressed in grief clothes. What has been trying to end in your life that you keep resurrecting? What version of yourself have you been holding onto past its expiration date? What situation, relationship, belief, or chapter is asking for a proper goodbye? The most important question: who are you being asked to become on the other side of this?", action:"Name the thing that needs to end. Not the thing you want to end — the thing that already has ended and you haven't acknowledged yet. Let it go.", affirmation:"I release what no longer serves me. I make room for who I am becoming. Endings are beginnings." },
  { id:14, name:"Temperance",        theme:"Balance · Patience · Sacred Alchemy",      img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e7496bf6a_generated_image.png", message:"You are being asked to blend, not break. To flow, not force. To find the middle current that carries you forward without burning you down. Temperance is the card of alchemy — the ancient art of combining opposites to create something that neither could become alone. Hot and cold. Rest and action. Solitude and connection. Ambition and acceptance. The tension you've been experiencing between two seemingly opposite needs in your life is not a problem to be solved. It is an invitation to find the synthesis. Right now the world wants you to believe that everything is either/or. Either you're succeeding or you're failing. Either you're healing or you're struggling. Either you're productive or you're resting. Temperance knows better. The most powerful version of your life is not lived in extremes — it's built in the place where opposites are honored and integrated. This card also carries a message about timing. The solution you've been looking for requires patience, not speed. You are in a process of becoming, and that process cannot be rushed without being broken.", action:"Identify where you've been living in extremes — all-or-nothing, full-send or complete shutdown. Find one way to introduce balance today.", affirmation:"I move with precision, not panic. I trust the alchemy of the process. I am becoming." },
  { id:15, name:"The Devil",         theme:"Shadow Work · Breaking the Pattern · Choose Freedom", img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e7496bf6a_generated_image.png", message:"The chains in this card are loose. Did you notice? The figures could step out at any time. They stay because the familiar pain has started to feel like home — because the devil you know feels safer than the freedom you don't. This is the card of the patterns that have their hooks in you. Not external enemies, not other people's cruelty — your own unconscious agreements with limitation. The relationship you keep returning to that you know is not right for you. The self-sabotage that activates the moment things start going well. The addiction — to substances, to chaos, to approval, to suffering itself — that keeps you cycling back to the same place. The story you keep telling about why you can't have what you want. The Devil doesn't judge you for any of this. This energy exists in every human being. But it does ask you to see it clearly, without flinching, without minimizing, without the comfortable lie that you don't have a choice. You have a choice. You've always had a choice. The chain is loose. The question is whether you're willing to see that — and whether you're willing to step out.", action:"Name the pattern with brutal honesty. Write it down. Then ask yourself: am I choosing this, or am I done choosing this?", affirmation:"I am not my patterns. I see my chains clearly. I choose freedom." },
  { id:16, name:"The Tower",         theme:"Sudden Change · Breakthrough · What's Real Remains", img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e7496bf6a_generated_image.png", message:"Something built on a false foundation is coming down. It might feel like your world is breaking. It is actually your world being cleared. The Tower is the most feared card in the deck because it brings sudden, dramatic, unavoidable change — the kind you didn't choose and can't slow down. But here is what the Tower actually is: it is truth arriving faster than you're comfortable with. The structure that's collapsing was never solid. The relationship, the plan, the belief, the identity — whatever is falling — it had cracks long before this moment. You may have felt them and looked away. The Tower just turns on the lights. This is not punishment. This is excavation. Everything false must fall so that everything real can be seen and built upon. The lightning strike in this card isn't destruction — it's illumination. What would you see, what would you finally be able to build, if the thing that's been blocking your view came down? The most important thing to know: what is real will remain. What you love that is true will still be there. What you are at your core cannot be destroyed by circumstances.", action:"Stop trying to hold together what is already coming apart. Ask yourself: what would I build if I started from the truth instead of the illusion?", affirmation:"What is falling was never mine to keep. What is real cannot be taken. I trust what remains." },
    { id:17, name:"The Star",          theme:"Hope · Healing · The Light Never Left",   img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/a89f558e9_generated_image.png", message:"After everything — you are still here. And that is not a small thing. The Star appears after the Tower, after the destruction, after the kind of loss that makes you wonder if the light was ever real. And it says: it was real. It is real. It never went out. You went through something that would have broken many people, and you are still standing in this moment, still searching, still asking, still reaching — and that reaching is what the Star responds to. This card does not promise ease. It does not promise that the hard part is completely over. What it promises is that the light is accessible to you right now, in this moment, even if everything feels uncertain. You are allowed to hope again. Not the desperate, white-knuckled hoping of someone who has nothing — but the soft, open hoping of someone who has survived and is beginning, slowly, to believe that good things are still possible. Let yourself want something. Let yourself imagine a version of your life that feels good. Without immediately bracing for it to be taken away. Without the armor of lowered expectations. The Star is the universe handing you permission to believe.", action:"Write down one thing you genuinely hope for — for yourself, for your life. Let yourself want it without immediately protecting yourself from the wanting.", affirmation:"I am allowed to hope. I am allowed to heal. The light in me never went out." },
  { id:18, name:"The Moon",          theme:"Illusion · The Unconscious · Navigate the Dark", img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/a89f558e9_generated_image.png", message:"Not everything is as it appears right now. The Moon rules the realm of the unconscious — the dreams, the fears, the half-truths, the projections, the deep waters where your unprocessed experiences live. When this card appears, things are murky. The path forward isn't fully lit. The situation you're trying to figure out has layers that aren't visible yet, and people in your life may not be showing you their whole truth. This is not a time for certainty. It is a time for navigation. The Moon asks you to trust your instincts even when you can't fully explain them. The feeling you get in your body when something is off is real information — even if you can't prove it yet. The anxiety that visits you in the dark hours isn't always irrational — sometimes it is your subconscious doing the math your waking mind refuses to do. But the Moon also warns: not every shadow is a threat. Fear has a way of distorting shapes in the dark, making small things enormous, making uncertainty feel like danger. Your work right now is to move through the unknown without either ignoring your instincts or being consumed by your fears. Trust what you feel. Keep moving. The light will come.", action:"Write down what you know in your gut about a situation you've been rationalizing. Trust that knowing even without proof.", affirmation:"I navigate the unknown with trust. My instincts are my compass in the dark." },
  { id:19, name:"The Sun",           theme:"Joy · Vitality · Let It Be Good",         img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e87c2dad0_generated_image.png", message:"This is a card of genuine, radiant, uncomplicated joy — and the first thing it asks is whether you're going to let it land. So much of the time, when good things arrive, you're already preparing for the other shoe to drop. Already making it smaller, already finding the catch, already telling yourself it won't last. The Sun is asking you to stop doing that. This good thing that is present in your life right now — or that is arriving — is real. You do not need to earn it more. You do not need to explain it. You do not need to wait for confirmation that you deserve it before you let yourself feel it. Vitality, warmth, success, genuine happiness — these are your birthright, not bonuses you get after you've suffered enough or worked hard enough or proven yourself sufficiently. The Sun also carries a message about visibility. You have been playing smaller than you are. You have been dimming yourself in rooms where your full light would be welcome. Stop. Shine. The people who are bothered by your light are telling you something important about themselves — and nothing important about you.", action:"Do one thing today purely because it brings you joy. Not because it's productive. Not because it checks a box. Just because it feels good and good is allowed.", affirmation:"I let good things be good. I receive joy without guilt. I shine without apology." },
  { id:20, name:"Judgement",         theme:"Awakening · The Call · Rise Into Who You Are", img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e7496bf6a_generated_image.png", message:"There is a call being sounded and you have been pretending you can't hear it. The Judgement card is one of the most profound in the entire deck — it is the moment of awakening, the moment the soul hears its true purpose and is asked to respond. Not someday. Now. Think about the thing that keeps coming back to you. The idea that won't leave you alone. The purpose you keep circling but talking yourself out of. The version of your life that feels both terrifying and undeniably right. That is the call. And the Judgement card is not asking whether you feel ready. It is not asking whether the timing is perfect. It is asking: are you done waiting? Because the version of you that is supposed to rise — the one who answers the call fully, who shows up for their real purpose without apology, who stops playing small to keep others comfortable — that version of you is available right now. Not after more preparation. Not after more healing. Not after you've fixed the thing you keep using as an excuse. The trumpet is sounding. Rise.", action:"Write down the call you've been ignoring. Then write down the one thing you would do today if you actually believed you were meant for it.", affirmation:"I rise when called. I answer with everything I am. My purpose is not waiting for permission." },
  { id:21, name:"The World",         theme:"Completion · Integration · You Actually Did It", img:"https://media.base44.com/images/public/69dabcfbdff2d23eb6ddb562/e7496bf6a_generated_image.png", message:"You have arrived. Not at the end of everything — but at a real, significant completion. Something that began as a question has become a knowing. A journey that started in uncertainty, in fear, in the raw early days of not knowing if you were going to make it — has brought you here. And here is further than you thought you'd get. Before you immediately look for the next thing, before you minimize what this moment means, before your mind sprints to the next problem to solve — stop. Let this land. You earned this. The World is the card of integration — not just celebration, but the deep, quiet satisfaction of having seen something through. Of having become someone different through the doing of it. Look at who you were when this chapter started and who you are now. That transformation is not small. That is the entire point. The World also carries within it the seed of the next beginning — because cycles don't end, they complete and begin again at a higher level. But right now, in this moment, you are being asked to receive what you've built. To stand in the fullness of what you've become. You did it.", action:"Stop and actually celebrate — not later, not quietly, not in a way that minimizes it. This completion deserves to be felt.", affirmation:"I honor how far I've come. I stand in the fullness of what I've built. I arrived." },
];
function shuffle(arr) {
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}
function Stars() {
  const stars=Array.from({length:55},(_,i)=>({id:i,x:Math.random()*100,y:Math.random()*100,s:Math.random()<.3?2:1,d:2+Math.random()*4}));
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {stars.map(s=>(
        <div key={s.id} style={{position:"absolute",left:s.x+"%",top:s.y+"%",width:s.s,height:s.s,borderRadius:"50%",background:s.id%5===0?"#C9952A":s.id%7===0?"#E8651A":"#fff",opacity:.2,animation:`twinkle ${s.d}s ease-in-out infinite alternate`}}/>
      ))}
    </div>
  );
}

// ── READING TAB (inner circle version — with Message From Them) ───────────────
function ReadingTab() {
  const [cards,setCards]=useState(null);
  const [flipped,setFlipped]=useState({0:false,1:false,2:false});
  const [synthesis,setSynthesis]=useState(null);
  const [loadingSynth,setLoadingSynth]=useState(false);
  const [copied,setCopied]=useState(false);
  const [started,setStarted]=useState(false);
  const [mode,setMode]=useState("self"); // "self" | "them"
  const [theirName,setTheirName]=useState("");
  const [theirRelation,setTheirRelation]=useState("");

  const positions=[{label:"PAST"},{label:"PRESENT"},{label:"FUTURE"}];
  const allFlipped=flipped[0]&&flipped[1]&&flipped[2];

  const startReading=()=>{
    setCards(shuffle(DECK).slice(0,3));
    setFlipped({0:false,1:false,2:false});
    setSynthesis(null);
    setStarted(true);
  };

  const getSynthesis=async()=>{
    setLoadingSynth(true);
    setSynthesis(null);
    const cardNames=cards.map((c,i)=>`${positions[i].label}: ${c.name} (${c.theme})`).join(", ");
    const context = mode==="them"
      ? `This reading is a message from ${theirName||"someone important"} (${theirRelation||"a person in your life"}). Frame the entire reading as what they would want you to know — what they feel, what they can't say, what they're holding.`
      : "This is a personal reading for the seeker.";
    try {
      const controller = new AbortController();
      const timeout = setTimeout(()=>controller.abort(), 30000);
      const resp = await fetch(
        `https://api.base44.com/api/apps/69dabcfbdff2d23eb6ddb562/functions/synthesisReading`,
        {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({name:"Seeker",sign:"Unknown",question:context,cards:cardNames}),
          signal:controller.signal
        }
      );
      clearTimeout(timeout);
      const data = await resp.json();
      setSynthesis(data.success&&data.text ? data.text : "The cards have spoken. Trust what you already know.");
    } catch(e) {
      setSynthesis("The cards have spoken. Trust what you already know.");
    }
    setLoadingSynth(false);
  };

  const reset=()=>{
    setStarted(false); setCards(null);
    setFlipped({0:false,1:false,2:false});
    setSynthesis(null);
    setMode("self");
    setTheirName(""); setTheirRelation("");
  };

  if(!started) return (
    <div style={{animation:"fadeUp .6s ease",maxWidth:540,margin:"0 auto",textAlign:"center"}}>
      {/* Mode selector */}
      <div style={{marginBottom:28}}>
        <div style={{fontSize:11,letterSpacing:3,color:B.muted,marginBottom:14}}>WHO IS THIS READING FOR?</div>
        <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:24}}>
          <button onClick={()=>setMode("self")} style={{
            background:mode==="self"?`linear-gradient(135deg,${B.gold}33,${B.amber}22)`:"transparent",
            border:`1px solid ${mode==="self"?B.gold:B.border}`,
            borderRadius:12,padding:"10px 20px",color:mode==="self"?B.gold:B.muted,
            fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:1
          }}>🔮 FOR ME</button>
          <button onClick={()=>setMode("them")} style={{
            background:mode==="them"?`linear-gradient(135deg,${B.rose}33,${B.pur}22)`:"transparent",
            border:`1px solid ${mode==="them"?B.rose:B.border}`,
            borderRadius:12,padding:"10px 20px",color:mode==="them"?B.rose:B.muted,
            fontSize:12,fontWeight:700,cursor:"pointer",letterSpacing:1
          }}>💌 MESSAGE FROM THEM</button>
        </div>

        {mode==="them"&&(
          <div style={{background:B.card,border:`1px solid ${B.rose}44`,borderRadius:14,padding:20,marginBottom:20,animation:"fadeUp .3s ease",textAlign:"left"}}>
            <div style={{fontSize:11,color:B.rose,letterSpacing:2,marginBottom:14,textAlign:"center"}}>WHO ARE THEY TO YOU?</div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:B.muted,letterSpacing:1,marginBottom:6}}>THEIR NAME (optional)</div>
              <input
                value={theirName}
                onChange={e=>setTheirName(e.target.value)}
                placeholder="e.g. Mom, Alex, my ex..."
                style={{width:"100%",background:"#07040e",border:`1px solid ${B.border}`,borderRadius:8,padding:"9px 12px",color:B.text,fontSize:13,outline:"none",boxSizing:"border-box"}}
              />
            </div>
            <div>
              <div style={{fontSize:11,color:B.muted,letterSpacing:1,marginBottom:6}}>RELATIONSHIP</div>
              <input
                value={theirRelation}
                onChange={e=>setTheirRelation(e.target.value)}
                placeholder="e.g. passed loved one, person who wronged me, someone I miss..."
                style={{width:"100%",background:"#07040e",border:`1px solid ${B.border}`,borderRadius:8,padding:"9px 12px",color:B.text,fontSize:13,outline:"none",boxSizing:"border-box"}}
              />
            </div>
            <div style={{fontSize:11,color:B.muted,marginTop:12,textAlign:"center",lineHeight:1.6}}>
              The cards will channel what they want you to know — what they feel, what they couldn't say, what they're holding.
            </div>
          </div>
        )}
      </div>

      <div style={{marginBottom:32}}>
        <div style={{fontSize:"clamp(22px,5vw,30px)",fontWeight:900,marginBottom:8}}>
          {mode==="them"
            ? <><span style={{color:B.text}}>A message is</span><span style={{display:"block",background:`linear-gradient(90deg,${B.rose},${B.pur})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>waiting for you.</span></>
            : <><span style={{color:B.text}}>The cards know</span><span style={{display:"block",background:`linear-gradient(90deg,${B.gold},${B.amber})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>what you need.</span></>
          }
        </div>
        <div style={{color:B.muted,fontSize:14,marginBottom:32}}>Three cards. Three moments. One story.</div>
        <button onClick={startReading} style={{
          background:mode==="them"
            ?`linear-gradient(135deg,${B.rose},${B.pur})`
            :`linear-gradient(135deg,${B.gold},${B.amber})`,
          border:"none",borderRadius:14,padding:"16px 40px",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",letterSpacing:1,
          boxShadow:mode==="them"?`0 0 30px ${B.rose}44`:`0 0 30px ${B.gold}44`
        }}>
          {mode==="them" ? "💌 PULL THEIR MESSAGE" : "✦ DRAW MY CARDS"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{animation:"fadeUp .5s ease",maxWidth:700,margin:"0 auto"}}>
      <div style={{textAlign:"center",marginBottom:24}}>
        <div style={{fontSize:11,letterSpacing:3,color:mode==="them"?B.rose:B.gold,marginBottom:6}}>
          {mode==="them" ? `💌 MESSAGE FROM ${(theirName||"THEM").toUpperCase()}` : "PAST · PRESENT · FUTURE"}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:24}}>
        {cards&&cards.map((card,i)=>(
          <div key={i} onClick={()=>!flipped[i]&&setFlipped(f=>({...f,[i]:true}))} style={{cursor:flipped[i]?"default":"pointer",perspective:1000}}>
            <div style={{borderRadius:14,overflow:"hidden",border:`1px solid ${flipped[i]?(mode==="them"?B.rose:B.gold):B.border}`,background:B.card,minHeight:180,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"border-color .3s"}}>
              {!flipped[i] ? (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:16}}>
                  <img src={CARD_BACK} alt="card back" style={{width:"100%",maxWidth:80,borderRadius:8,opacity:.8}}/>
                  <div style={{fontSize:10,color:B.muted,letterSpacing:2}}>{positions[i].label}</div>
                  <div style={{fontSize:11,color:B.cyn,marginTop:4}}>tap to reveal</div>
                </div>
              ) : (
                <div style={{animation:"flipCard .4s ease",padding:14,textAlign:"center"}}>
                  <img src={card.img} alt={card.name} style={{width:"100%",maxWidth:70,borderRadius:8,marginBottom:8}}/>
                  <div style={{fontSize:10,color:B.muted,letterSpacing:2,marginBottom:4}}>{positions[i].label}</div>
                  <div style={{fontSize:13,fontWeight:700,color:B.text,marginBottom:4}}>{card.name}</div>
                  <div style={{fontSize:10,color:mode==="them"?B.rose:B.gold,lineHeight:1.4}}>{card.theme}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {allFlipped&&!synthesis&&(
        <div style={{background:B.card,border:`1px solid ${B.border}`,borderRadius:16,padding:20,marginBottom:20}}>
          {cards.map((card,i)=>(
            <div key={i} style={{marginBottom:16,paddingBottom:16,borderBottom:i<2?`1px solid ${B.border}`:"none"}}>
              <div style={{fontSize:11,color:mode==="them"?B.rose:B.gold,letterSpacing:2,marginBottom:6}}>{positions[i].label} · {card.name}</div>
              <div style={{color:B.muted,fontSize:13,lineHeight:1.7}}>{card.message}</div>
              <div style={{marginTop:8,fontSize:12,color:B.cyn,fontStyle:"italic"}}>✦ {card.action}</div>
            </div>
          ))}
        </div>
      )}

      {allFlipped&&(
        <div style={{textAlign:"center",marginBottom:16}}>
          {!synthesis&&!loadingSynth&&(
            <button onClick={getSynthesis} style={{
              background:mode==="them"?`linear-gradient(135deg,${B.rose},${B.pur})`:`linear-gradient(135deg,${B.gold},${B.amber})`,
              border:"none",borderRadius:12,padding:"13px 28px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",letterSpacing:1
            }}>
              {mode==="them" ? "💌 RECEIVE THEIR MESSAGE" : "✦ WEAVE MY READING"}
            </button>
          )}
          {loadingSynth&&<div style={{color:B.muted,fontSize:13,padding:20}}>
            {mode==="them" ? "Channeling their message..." : "The cards are weaving your story..."}
          </div>}
        </div>
      )}

      {synthesis&&(
        <div style={{background:mode==="them"?`linear-gradient(135deg,${B.rose}15,${B.pur}10)`:`linear-gradient(135deg,${B.gold}15,${B.amber}10)`,border:`1px solid ${mode==="them"?B.rose:B.gold}44`,borderRadius:16,padding:24,marginBottom:20,animation:"fadeUp .6s ease"}}>
          <div style={{fontSize:11,color:mode==="them"?B.rose:B.gold,letterSpacing:3,marginBottom:16,textAlign:"center"}}>
            {mode==="them" ? `💌 THEIR MESSAGE TO YOU` : "YOUR READING"}
          </div>
          <div style={{color:B.text,fontSize:14,lineHeight:1.9,whiteSpace:"pre-line"}}>{synthesis}</div>
          <div style={{marginTop:24,paddingTop:20,borderTop:`1px solid ${B.border}`,display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>{
              const shareText=`✨ My New Tarotories reading:\n${cards.map((c,i)=>["Past","Present","Future"][i]+": "+c.name).join(" · ")}\n\n${synthesis.slice(0,200)}...\n\nhttps://anchor-point-marketing-superagent-b56ededc.base44.app/tarotories`;
              if(navigator.share){navigator.share({title:"My Reading",text:shareText});}
              else if(navigator.clipboard){navigator.clipboard.writeText(shareText).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);}).catch(()=>{});}
            }} style={{background:`linear-gradient(135deg,${B.gold},${B.amber})`,border:"none",borderRadius:12,padding:"10px 20px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>
              {copied ? "✓ Copied!" : "📲 Share"}
            </button>
            <button onClick={()=>{
              const tweetText=encodeURIComponent(`✨ Just pulled my cards:\n${cards.map((c,i)=>["Past","Present","Future"][i]+": "+c.name).join(" · ")}\n\n${synthesis.slice(0,120)}...\n\n🔮 https://anchor-point-marketing-superagent-b56ededc.base44.app/tarotories`);
              window.open("https://twitter.com/intent/tweet?text="+tweetText,"_blank");
            }} style={{background:"#000",border:`1px solid ${B.border}`,borderRadius:12,padding:"10px 20px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>
              𝕏 Post
            </button>
          </div>
          <div style={{textAlign:"center",marginTop:12,fontSize:11,color:B.muted}}>🔒 No tracking · Your reading stays yours.</div>
        </div>
      )}

      {allFlipped&&(
        <div style={{textAlign:"center",marginTop:8}}>
          <button onClick={reset} style={{background:"transparent",border:`1px solid ${B.border}`,borderRadius:10,padding:"10px 24px",color:B.muted,fontSize:13,cursor:"pointer"}}>↩ New Reading</button>
        </div>
      )}
    </div>
  );
}

// ── HOROSCOPE TAB ─────────────────────────────────────────────────────────────
const SIGNS=["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
const today=new Date();
const seed=(today.getFullYear()*10000+((today.getMonth()+1)*100)+today.getDate());
function seedRand(n){let x=Math.sin(seed+n)*10000;return x-Math.floor(x);}

const HOROSCOPES={
  Aries:{energy:"Fire is moving through you today. Something that felt impossible last week is starting to look like a choice. You don't need permission to begin.",crystal:"Carnelian",affirmation:"I move first. I trust myself to figure it out as I go.",color:"#E8651A"},
  Taurus:{energy:"You've been patient. Longer than most people could manage. Today the universe is asking you to notice what has quietly shifted in your favor while you were holding steady.",crystal:"Rose Quartz",affirmation:"My pace is my power. What is mine will not pass me.",color:"#C9952A"},
  Gemini:{energy:"Two things can be true at once — you can love someone and be exhausted by them. You can want something deeply and know it isn't ready yet. Honor all of it.",crystal:"Citrine",affirmation:"I hold complexity without needing to resolve it immediately.",color:"#10D8F0"},
  Cancer:{energy:"Someone needs less advice and more of you just being present. And somewhere, someone is holding space for you the same way. Let yourself be held.",crystal:"Moonstone",affirmation:"My softness is not a vulnerability. It is a gift I give carefully.",color:"#8844E8"},
  Leo:{energy:"You've been performing strength for so long that you've forgotten what it feels like to just be. Today — just be. The real you is more magnetic than the version you've been showing.",crystal:"Sunstone",affirmation:"I don't need to perform. My presence is already enough.",color:"#C9952A"},
  Virgo:{energy:"The details you've been obsessing over are not the thing. The thing is underneath the details. Stop analyzing and start feeling — even for just ten minutes.",crystal:"Moss Agate",affirmation:"I release perfection. Progress is the only standard I need to meet today.",color:"#10D8F0"},
  Libra:{energy:"You keep weighing the options because you're afraid of choosing wrong. But the longer you wait, the more the choice makes itself. Decide from your values, not your fears.",crystal:"Lapis Lazuli",affirmation:"I choose, and I trust my choice. Indecision is also a decision.",color:"#D4159A"},
  Scorpio:{energy:"Something is ending so something else can begin — and you already know which it is. The grief is real. So is the space it's clearing for what's next.",crystal:"Obsidian",affirmation:"I release what no longer belongs to the person I'm becoming.",color:"#5c3d9e"},
  Sagittarius:{energy:"The truth you've been dancing around needs to be spoken — to yourself first. Once you say it out loud, the path forward becomes obvious.",crystal:"Turquoise",affirmation:"I speak my truth. The right people won't flinch.",color:"#E8651A"},
  Capricorn:{energy:"You've earned more than you've claimed. Today is a day to stop building toward the life you want and start inhabiting it — even just a little bit.",crystal:"Garnet",affirmation:"I receive what I've worked for without apologizing for it.",color:"#C9952A"},
  Aquarius:{energy:"The idea that keeps returning to you is not random. The universe recycles thoughts it wants you to act on. Listen to the one you keep dismissing.",crystal:"Amethyst",affirmation:"My vision is ahead of its time. That is a feature, not a flaw.",color:"#8844E8"},
  Pisces:{energy:"You felt something this week that other people would have explained away. Don't explain it away. Some things arrive as feeling before they arrive as fact.",crystal:"Aquamarine",affirmation:"I trust what I feel before I can prove it. My intuition is data.",color:"#10D8F0"},
};

function HoroscopeTab() {
  const [selected,setSelected]=useState(null);
  const h=selected?HOROSCOPES[selected]:null;
  return (
    <div style={{maxWidth:600,margin:"0 auto",animation:"fadeUp .5s ease"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:"clamp(20px,4vw,26px)",fontWeight:900,marginBottom:6}}>Daily <span style={{background:`linear-gradient(90deg,${B.gold},${B.amber})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Horoscope</span></div>
        <div style={{color:B.muted,fontSize:13}}>Your cosmic weather for today</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:24}}>
        {SIGNS.map(s=>(
          <button key={s} onClick={()=>setSelected(s)} style={{background:selected===s?`linear-gradient(135deg,${B.gold}33,${B.amber}22)`:B.card,border:`1px solid ${selected===s?B.gold:B.border}`,borderRadius:10,padding:"10px 6px",color:selected===s?B.text:B.muted,fontSize:12,fontWeight:selected===s?700:400,cursor:"pointer",transition:"all .2s"}}>
            {s}
          </button>
        ))}
      </div>
      {h&&(
        <div style={{background:`linear-gradient(135deg,${B.card},#0a0614)`,border:`1px solid ${h.color}44`,borderRadius:20,padding:28,animation:"fadeUp .4s ease"}}>
          <div style={{textAlign:"center",marginBottom:20}}>
            <div style={{fontSize:26,fontWeight:900,color:h.color,marginBottom:4}}>{selected}</div>
          </div>
          <div style={{background:"#07040e",borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{fontSize:11,color:B.gold,letterSpacing:2,marginBottom:8}}>TODAY'S ENERGY</div>
            <div style={{color:B.text,fontSize:14,lineHeight:1.8}}>{h.energy}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:16}}>
            <div style={{background:"#07040e",borderRadius:12,padding:14,textAlign:"center"}}>
              <div style={{fontSize:11,color:B.muted,letterSpacing:2,marginBottom:6}}>CRYSTAL</div>
              <div style={{fontSize:14,fontWeight:700,color:h.color}}>{h.crystal}</div>
            </div>
            <div style={{background:"#07040e",borderRadius:12,padding:14,textAlign:"center"}}>
              <div style={{fontSize:11,color:B.muted,letterSpacing:2,marginBottom:6}}>COLOR</div>
              <div style={{width:24,height:24,borderRadius:"50%",background:h.color,margin:"0 auto"}}/>
            </div>
          </div>
          <div style={{borderTop:`1px solid ${B.border}`,paddingTop:16,textAlign:"center"}}>
            <div style={{fontSize:11,color:B.gold,letterSpacing:2,marginBottom:8}}>AFFIRMATION</div>
            <div style={{color:B.text,fontSize:14,fontStyle:"italic",lineHeight:1.6}}>"{h.affirmation}"</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── BIRTH CHART HELPER (with unknown time option) ─────────────────────────────
function BirthInput({value,onChange,label,placeholder,optional=false}) {
  return (
    <div style={{marginBottom:12}}>
      <div style={{fontSize:11,color:B.muted,letterSpacing:1,marginBottom:6}}>{label}{optional&&<span style={{color:B.pur,marginLeft:6}}>optional</span>}</div>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:"100%",background:"#07040e",border:`1px solid ${B.border}`,borderRadius:8,padding:"9px 12px",color:B.text,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
    </div>
  );
}

// ── HOME TAB ─────────────────────────────────────────────────────────────────
function HomeTab({onGoToReading}) {
  return (
    <div style={{animation:"fadeUp .5s ease"}}>
      <div style={{textAlign:"center",padding:"40px 0 48px"}}>
        <div style={{fontSize:12,letterSpacing:4,color:B.gold,marginBottom:16,textTransform:"uppercase"}}>✦ The Inner Circle ✦</div>
        <h1 style={{fontSize:"clamp(28px,6vw,52px)",fontWeight:900,lineHeight:1.1,margin:"0 0 20px",color:B.text}}>
          You were guided here
          <span style={{display:"block",background:`linear-gradient(135deg,${B.gold},${B.amber},${B.rose})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>for a reason.</span>
        </h1>
        <p style={{fontSize:16,color:B.muted,lineHeight:1.8,maxWidth:480,margin:"0 auto 36px"}}>
          Not the algorithm. Not an ad. Something brought you here. The cards are ready when you are.
        </p>
        <button onClick={onGoToReading} style={{background:`linear-gradient(135deg,${B.gold},${B.amber})`,border:"none",color:"#fff",padding:"14px 36px",borderRadius:30,fontSize:16,fontWeight:700,cursor:"pointer",boxShadow:`0 0 30px ${B.gold}44`}}>
          ✦ Get Your Reading
        </button>
        <div style={{marginTop:14,fontSize:12,color:B.muted}}>No account · No tracking · Just the cards</div>
      </div>

      {/* Features grid */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14,marginBottom:48}}>
        {[
          {emoji:"💌",title:"Message From Them",desc:"Channel what someone can't say — a passed loved one, an ex, someone who hurt you. What would they want you to know?"},
          {emoji:"🔮",title:"AI Synthesis Reading",desc:"All three cards woven into one personal reading that speaks directly to your situation."},
          {emoji:"⭐",title:"Daily Horoscope",desc:"Your cosmic weather — grounded and real, not generic."},
          {emoji:"🃏",title:"22 Major Arcana",desc:"Full deck with meanings written in plain truth. No mystical fluff."},
          {emoji:"✨",title:"Visual Omens",desc:"Coming soon — the universe sends you a sign to watch for today."},
          {emoji:"🌙",title:"More Spreads",desc:"Celtic Cross, Love, Shadow Work, Full Moon — coming to the inner circle first."},
        ].map((f,i)=>(
          <div key={i} style={{background:B.card,border:`1px solid ${B.border}`,borderRadius:14,padding:22,transition:"border-color .2s"}}>
            <div style={{fontSize:28,marginBottom:10}}>{f.emoji}</div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:6,color:B.text}}>{f.title}</div>
            <div style={{color:B.muted,fontSize:13,lineHeight:1.6}}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={{maxWidth:520,margin:"0 auto 48px",background:B.card,border:`1px solid ${B.gold}33`,borderRadius:20,padding:28,position:"relative"}}>
        <div style={{position:"absolute",top:-12,left:24,background:B.bg,padding:"0 10px",fontSize:11,color:B.gold,letterSpacing:3,fontWeight:700}}>FROM THE BUILDER</div>
        <p style={{color:B.text,fontSize:14,lineHeight:1.9,margin:"8px 0",fontStyle:"italic"}}>
          "I built this for me, my mom, and the people I trust. No ads. No data. No corporate energy. New features come here first — to the people who actually get it."
        </p>
        <div style={{fontSize:12,color:B.muted,marginTop:8}}>— Kourtney (Lyra)</div>
      </div>
    </div>
  );
}

// ── SPREADS TAB ───────────────────────────────────────────────────────────────
function SpreadsTab({onGoToReading}) {
  const spreads=[
    {name:"Single Card",desc:"One card. One clear message.",free:true},
    {name:"Past · Present · Future",desc:"Three cards. The full arc of your situation.",free:true},
    {name:"Message From Them",desc:"What someone can't say in words — a loved one, an ex, someone gone.",free:true},
    {name:"Celtic Cross",desc:"The deep dive. Every angle of your situation.",free:false,soon:false},
    {name:"Love & Relationships",desc:"What's real, what's in the way, what's possible.",free:false,soon:false},
    {name:"Shadow Work",desc:"What you've been avoiding. What it's costing you.",free:false,soon:false},
    {name:"Full Moon Release",desc:"What to let go. What to call in. What's being illuminated.",free:false,soon:false},
  ];
  return (
    <div style={{maxWidth:600,margin:"0 auto",animation:"fadeUp .5s ease"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:"clamp(18px,4vw,26px)",fontWeight:900,marginBottom:6,color:B.text}}>Spread Library</div>
        <div style={{color:B.muted,fontSize:13}}>Choose your depth.</div>
      </div>
      {spreads.map((s,i)=>(
        <div key={i} style={{background:B.card,border:`1px solid ${s.free?B.gold:B.border}`,borderRadius:14,padding:18,marginBottom:10,display:"flex",justifyContent:"space-between",alignItems:"center",gap:12}}>
          <div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:4,color:B.text}}>{s.name}</div>
            <div style={{color:B.muted,fontSize:13,lineHeight:1.5}}>{s.desc}</div>
          </div>
          {s.free ? (
            <button onClick={onGoToReading} style={{background:`linear-gradient(135deg,${B.gold},${B.amber})`,border:"none",borderRadius:10,padding:"8px 14px",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>Try Free</button>
          ) : (
            <div style={{background:B.rose+"22",border:`1px solid ${B.rose}44`,borderRadius:10,padding:"6px 12px",color:B.rose,fontSize:11,fontWeight:700,whiteSpace:"nowrap"}}>Coming ✦</div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── DECKS TAB ─────────────────────────────────────────────────────────────────
function DecksTab() {
  const decks=[
    {name:"The Shadow Deck",desc:"Dark, cosmic, raw truth",color:B.pur},
    {name:"The Rose Deck",desc:"Soft power and divine feminine",color:B.rose},
    {name:"The Void Deck",desc:"Deep space energy and mystery",color:"#6644aa"},
    {name:"The Ember Deck",desc:"Fire, transformation, rebirth",color:B.amber},
    {name:"The Celestial Deck",desc:"Stars, light, higher self",color:B.cyn},
  ];
  return (
    <div style={{maxWidth:600,margin:"0 auto",animation:"fadeUp .5s ease"}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{fontSize:"clamp(18px,4vw,26px)",fontWeight:900,marginBottom:6,color:B.text}}>The Collections</div>
        <div style={{color:B.muted,fontSize:13}}>5 decks. All energies. Inner circle gets new drops first.</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
        {decks.map((d,i)=>(
          <div key={i} style={{background:B.card,border:`1px solid ${d.color}55`,borderRadius:16,padding:20,textAlign:"center"}}>
            <div style={{width:48,height:72,background:d.color+"22",borderRadius:8,margin:"0 auto 12px",border:`1px solid ${d.color}88`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🃏</div>
            <div style={{fontWeight:700,fontSize:13,marginBottom:4,color:B.text}}>{d.name}</div>
            <div style={{color:B.muted,fontSize:12}}>{d.desc}</div>
          </div>
        ))}
        <div style={{background:B.card,border:`1px solid ${B.gold}55`,borderRadius:16,padding:20,textAlign:"center",gridColumn:"1/-1"}}>
          <div style={{fontWeight:700,fontSize:13,marginBottom:4,color:B.text}}>✦ Monthly Inner Circle Drops</div>
          <div style={{color:B.muted,fontSize:12}}>New decks added here first — before the public app</div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Tarotories() {
  const [tab,setTab]=useState("home");
  const tabs=[
    {id:"home",     label:"Home",      emoji:"✦"},
    {id:"reading",  label:"Reading",   emoji:"🔮"},
    {id:"them",     label:"From Them", emoji:"💌"},
    {id:"horoscope",label:"Horoscope", emoji:"⭐"},
    {id:"spreads",  label:"Spreads",   emoji:"🃏"},
    {id:"decks",    label:"Decks",     emoji:"🌙"},
  ];

  return (
    <div style={{minHeight:"100vh",background:B.bg,color:B.text,fontFamily:"'Inter',sans-serif",position:"relative"}}>
      <Stars/>
      <style>{`
        @keyframes twinkle{from{opacity:.05}to{opacity:.5}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes flipCard{0%{transform:rotateY(90deg);opacity:0}100%{transform:rotateY(0deg);opacity:1}}
      `}</style>

      <header style={{position:"relative",zIndex:10,padding:"36px 16px 0",textAlign:"center"}}>
        <div style={{fontSize:11,letterSpacing:6,color:B.gold,marginBottom:6,fontWeight:700}}>✦ NEW TAROTORIES ✦</div>
        <div style={{fontSize:10,color:B.muted,letterSpacing:4}}>THE INNER CIRCLE</div>
      </header>

      <nav style={{position:"relative",zIndex:10,display:"flex",justifyContent:"center",gap:4,padding:"16px 12px 0",flexWrap:"wrap"}}>
        {tabs.map(t=>(
          <button key={t.id}
            onClick={()=>t.id==="them" ? (setTab("reading")) : setTab(t.id)}
            style={{
              background:tab===t.id?`linear-gradient(135deg,${B.gold}33,${B.amber}22)`:"transparent",
              border:`1px solid ${tab===t.id?B.gold:B.border}`,
              borderRadius:20,padding:"7px 14px",
              color:tab===t.id?B.text:B.muted,
              fontSize:11,fontWeight:700,letterSpacing:1,cursor:"pointer",transition:"all .2s"
            }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </nav>

      <main style={{position:"relative",zIndex:10,maxWidth:960,margin:"0 auto",padding:"24px 16px 80px"}}>
        {tab==="home"      &&<HomeTab onGoToReading={()=>setTab("reading")}/>}
        {tab==="reading"   &&<ReadingTab/>}
        {tab==="horoscope" &&<HoroscopeTab/>}
        {tab==="spreads"   &&<SpreadsTab onGoToReading={()=>setTab("reading")}/>}
        {tab==="decks"     &&<DecksTab/>}
      </main>

      <footer style={{position:"relative",zIndex:10,textAlign:"center",padding:"24px",borderTop:`1px solid ${B.border}`}}>
        <div style={{fontSize:11,fontWeight:900,letterSpacing:5,marginBottom:4,background:`linear-gradient(90deg,${B.gold},${B.amber})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>NEW TAROTORIES ✦ INNER CIRCLE</div>
        <div style={{fontSize:10,color:B.muted,letterSpacing:2}}>EXPLORING THE UNKNOWN · FOR REFLECTION & DISCOVERY</div>
      </footer>
    </div>
  );
}
