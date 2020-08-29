
local difficultyToTime = {
    ["noob"] = 100000,
    ["easy"] = 10000,
    ["medium"] = 8000,
    ["hard"] = 6000,
    ["nightmare"] = 4000,
    ["tpope"] = 2000,
}

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

local extraSentences = {
    "One is the best Prime Number",
    "Brandon is the best One",
    "I Twitch when I think about the Discord",
    "My dog is also my dawg",
    "The internet is an amazing place full of interesting facts",
    "Did you know the internet crosses continental boundaries using a wire?!",
    "I am out of interesting facts to type here",
    "Others should contribute more sentences to be used in the game",
}

local function getRandomSentence()
    return extraSentences[math.random(#extraSentences)]
end


return {
    difficultyToTime = difficultyToTime,
    getRoundCount = getRoundCount,
    createEmpty = createEmpty,
    getTime = getTime,
    compareTable = compareTable,
    getRandomSentence = getRandomSentence
}

