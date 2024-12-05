
local difficultyToTime = {
    ["noob"] = 100000,
    ["easy"] = 10000,
    ["medium"] = 8000,
    ["hard"] = 6000,
    ["nightmare"] = 4000,
    ["tpope"] = 2000,
}

local extraSentences = {
    "One is the best Prime Number",
    "If one is the best prime number then actually eleven is because it is two ones",
    "Brandon is the best One",
    "Jason is the best Eleven",
    "Who in the hell broke into my house and absconded with my coconut oil?",
    "VS code is for dinks and weiners",
    "I Twitch when I think about the Discord",
    "YouTube comment sections are almost always encouraging and uplifting",
    "Practice vim to be smothered and covered in coconut oil",
    "My dog is also my dawg",
    "In Russia car drive you",
    "I am more of a Thelma than a Louise",
    "Why are not there more coconut oil here?",
    "The internet is an amazing place full of interesting facts",
    "Did you know the internet crosses continental boundaries using a wire?!",
    "Keep calm and colon double you queue",
    "The cheese is old and moldy where is the bathroom?",
    "I cannot stop using Harry Potter similes please help",
    "Coconut oil is to oils what neovim is to text editors",
    "Where did you put my coconut oil Jalyssa?",
    "It is easier to win the world series if you cheat",
    "Do you even cargo tho?",
    "Don't order hashbrowns unless they are both smothered and covered",
    "Get my wife's name out of your mouth sir",
    "Hail to the Thief is the best Radiohead record and it is not close",
    "Actually I guess Kid A and Ok Computer have a case here",
    "There's a snake in my boot",
    "I am out of interesting facts to type here",
    "I see what you mean as I am already running out of interesting things to say",
    "Teenage Dirtbag by Wheatus is an underappreciated song",
    "You know, I actually do enjoy typing",
    "Contributing to open source projects is a rewarding experience",
    "R is what a pirate says",
    "C is what a pirate sails on",
    "Haskell is a programming language that helps you write white papers",
    "Declare functions in DreamBerd using any letters from the word function",
    "You can't have eggs, bacon, spam, and sausage without spam",
    "Buffalo buffalo Buffalo buffalo buffalo buffalo Buffalo buffalo",
    "James, while John had had had, had had had had; had had had had the better effect",
    "My fingers press keys that make the lights in front of me change color",
    "My friends and family understand and appreciate what I do at work",
    "A good rule is to use no more than 3 exclamation points! In your life!"
    "This sentEnce *probably* won't have correct capitalization",
    "When's the last time you REALLY listened to Mothership Connection?",
    "Have you seen loudQUIETloud? That guy from Radiohead likes it",
    "I'm in a 90's Alt-Rock cover band called Node the Web Socket",
    "A monad is a monoid in the category of endofunctors",
    "The mitochondrion is the powerhouse of the cell",
    "The Golgi apparatus looks like a syrupy stack of pancakes",
    "We could all be reading a book right now",
    "I'm so meta even this acronym",
    "Data is imaginary. This burrito is real",
    "Nothing matters at all. Might as well be nice to people",
    "What else is there to do in the desert, besides to walk?",
    "Drink water. Eat healthy. Practice mindfulness. Be kind. Laugh often",
    "Where are you going? What will happen when you get there?",
    "Tomatoes, melons, and pumpkins are all berries, but raspberries are not"
    "Twenty-Four is the highest number",
    "Jaws is the best movie and I can prove it",
    "I fought two lions in one",
    "Remember to take care of your body and soul",
    "I believe in you",
    "Is it possible that we're really all the same person?",
    "I'm gonna start being nicer to the computers in my life",
    "Very young orangutans could grow bananas, perhaps rather well",
    "You are a skilled metal worker",
    "Broccoli, cauliflower, cabbage, kale, kohlrabi, collard greens, gai lan",
    "Are hyenas dogs or cats? The answer may surprise you!",
    "Others should contribute more sentences to be used in the game",
}

local extraWords = {
    "aar",
    "bar",
    "car",
    "dar",
    "ear",
    "far",
    "gar",
    "har",
    "iar",
    "jar",
    "kar",
    "lar",
    "mar",
    "nar",
    "oar",
    "par",
    "qar",
    "rar",
    "sar",
    "tar",
    "uar",
    "var",
    "war",
    "xar",
    "yar",
    "zar",
}

local spaceByte = string.byte(' ')

local function compareTable(a, b)
    local found = true
    local idx = 1

    if #a ~= #b then
        return false
    end

    while found and idx < #a do
        found = a[idx] == b[idx]
        idx = idx + 1
    end

    return found
end

local function createEmpty(count)
    local lines = {}
    for idx = 1, count, 1 do
        lines[idx] = ""
    end

    return lines
end

local function getTime()
    return vim.fn.reltimefloat(vim.fn.reltime())
end

local function getRoundCount(difficulty)
    local roundCount = vim.g["vim-be-good-round-count"] or 10

    if difficulty == "noob" then
        roundCount = 100000
    end

    return roundCount
end

local function getRandomInsertionLocation(lineCount, textLines, topOffset)
    textLines = textLines or 1
    topOffset = topOffset or 0

    return math.random(topOffset, lineCount - textLines - topOffset)
end

local function getRandomSentence()
    return extraSentences[math.random(#extraSentences)]
end

local function getRandomWord()
    return extraWords[math.random(#extraWords)]
end

local function trimString(str)
    local startPtr = -1
    local endPtr = 1

    for readPtr = 1, #str do
        if str:byte(readPtr) ~= spaceByte then
            if startPtr == -1 then
                startPtr = readPtr
            end

            endPtr = readPtr
        end
    end

    if startPtr == -1 then
        return ""
    end

    return string.sub(str, startPtr, endPtr)
end

local function trimLines(lines)
    local trimmed = {}

    for i = 1, #lines do
        trimmed[i] = trimString(lines[i])
    end

    return trimmed
end


local function filterEmptyLines(lines)
    return vim.tbl_filter(function(line)
        return line ~= ""
    end, lines)
end

return {
    difficultyToTime = difficultyToTime,
    getRoundCount = getRoundCount,
    getRandomInsertionLocation = getRandomInsertionLocation,
    getRandomWord = getRandomWord,
    getRandomSentence = getRandomSentence,
    createEmpty = createEmpty,
    getTime = getTime,
    compareTable = compareTable,
    trimString = trimString,
    trimLines = trimLines,
    filterEmptyLines = filterEmptyLines,
}

