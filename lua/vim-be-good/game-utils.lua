
local difficultyToTime = {
    ["noob"] = 100000,
    ["easy"] = 10000,
    ["medium"] = 8000,
    ["hard"] = 6000,
    ["nightmare"] = 4000,
    ["tpope"] = 2000,
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

local function getRandomWord()
    return extraWords[math.random(#extraWords)]
end

local function trimString(str)
    local startPtr = -1
    local endPtr = 1
    local readPtr = 1

    while readPtr <= #str do
        if str:byte(readPtr) ~= spaceByte then
            if startPtr == -1 then
                startPtr = readPtr
            end

            endPtr = readPtr
        end

        readPtr = readPtr + 1
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

return {
    difficultyToTime = difficultyToTime,
    getRoundCount = getRoundCount,
    getRandomInsertionLocation = getRandomInsertionLocation,
    getRandomWord = getRandomWord,
    createEmpty = createEmpty,
    getTime = getTime,
    compareTable = compareTable,
    trimString = trimString,
    trimLines = trimLines
}

