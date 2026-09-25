// Guide content. Each guide comes from something Mum said or did during the research.
// c: tile colour, tw: Twi title, en: English title, icon: inline SVG
// steps: { s: screen id from phone-screens.js, tw: Twi instruction, en: English, ask: show "Bisa abusua" }
export const GUIDES={
  video:{c:"#00754A",tw:"Frɛ video",en:"Video call",icon:'<svg viewBox="0 0 56 56" aria-hidden="true"><rect x="6" y="16" width="30" height="24" rx="5" fill="none" stroke="currentColor" stroke-width="4"/><polygon points="36,28 50,18 50,38" fill="currentColor"/></svg>',steps:[
    {s:'home',tw:"Mia WhatsApp no so.",en:"Press WhatsApp."},
    {s:'list',tw:"Mia obi a wopɛ sɛ wofrɛ no din so.",en:"Press the name of the person you want to call."},
    {s:'chat',tw:"Hwɛ soro wɔ nifa so. Mia video kamera no so.",en:"Look at the top right. Press the video camera."},
    {s:'dialog',tw:"Sɛ ɛbisa wo a, mia 'Call' so.",en:"If it asks you, press 'Call'."},
    {s:'calling',tw:"Twɛn kosi sɛ wɔbɛgye.",en:"Wait until they answer."}]},
  group:{c:"#c8102e",tw:"Fi group mu",en:"Leave and delete a group",icon:'<svg viewBox="0 0 56 56" aria-hidden="true"><rect x="8" y="8" width="24" height="40" rx="4" fill="none" stroke="currentColor" stroke-width="4"/><path d="M26 28 H50 M42 20 L50 28 L42 36" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>',steps:[
    {s:'gchat',tw:"Bue group no, na mia ne din a ɛwɔ soro no so.",en:"Open the group, then press its name at the top."},
    {s:'exitg',tw:"Twe kɔ fam koraa. Mia 'Exit group' kɔkɔɔ no so.",en:"Scroll to the bottom. Press the red 'Exit group'."},
    {s:'exitd',tw:"Mia 'Exit' bio.",en:"Press 'Exit' again."},
    {s:'delg',tw:"Afei mia 'Delete group' so.",en:"Now press 'Delete group'."},
    {s:'deld',tw:"Mia 'Delete' so. Group no afi hɔ.",en:"Press 'Delete'. The group is gone."}]},
  tiktok:{c:"#1b1b1b",tw:"Fa video to TikTok so",en:"Post a TikTok video",icon:'<svg viewBox="0 0 56 56" aria-hidden="true"><rect x="8" y="6" width="40" height="44" rx="8" fill="none" stroke="currentColor" stroke-width="4"/><polygon points="23,18 37,28 23,38" fill="currentColor"/></svg>',steps:[
    {s:'tthome',tw:"Mia TikTok no so.",en:"Press TikTok."},
    {s:'ttfeed',tw:"Mia '+' a ɛwɔ fam mfinimfini no so.",en:"Press the '+' at the bottom middle."},
    {s:'ttrec',tw:"Mia kɔkɔɔ kurukuruwa no so fi ase fa video. Mia bio na gyae.",en:"Press the red circle to start recording. Press again to stop."},
    {s:'ttnext',tw:"Mia 'Next' kɔkɔɔ no so.",en:"Press the red 'Next'."},
    {s:'ttpost',tw:"Mia 'Post' kɔkɔɔ no so. Wo video no afi adi.",en:"Press the red 'Post'. Your video is up."}]},
  popup:{c:"#1f5fbf",tw:"Nkrasɛm a mente ase",en:"A phone message I don't understand",icon:'<svg viewBox="0 0 56 56" aria-hidden="true"><rect x="6" y="8" width="44" height="32" rx="8" fill="none" stroke="currentColor" stroke-width="4"/><path d="M18 40 L14 50 L28 40" fill="currentColor"/><text x="28" y="32" text-anchor="middle" font-size="22" font-weight="700" fill="currentColor" font-family="Verdana,sans-serif">?</text></svg>',steps:[
    {s:'popup',tw:"Mmia biribiara so ntɛm. Gyae no sɛnea ɛte no.",en:"Don't press anything yet. Leave it as it is."},
    {s:'side',tw:"Mia power ne volume down bɔ mu ntɛm. Ɛbɛfa mfonini.",en:"Press power and volume down together quickly. It takes a picture."},
    {s:'side',tw:"Fa mfonini no soma abusua wɔ WhatsApp so. Wɔbɛkyerɛ wo ase.",en:"Send the picture to family on WhatsApp. They'll explain it to you.",ask:true}]}
};
