
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

