
local difficultyToTime = {
    ["noob"] = 100000,
    ["easy"] = 10000,
    ["medium"] = 8000,
    ["hard"] = 6000,
    ["nightmare"] = 4000,
    ["tpope"] = 2000,
}

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

local function getRoundCount(diffculty)
    local roundCount = vim.g["vim-be-good-round-count"] or 10

    if diffculty == "noob" then
        roundCount = 100000
    end

    return roundCount
end

return {
    difficultyToTime = difficultyToTime,
    getRoundCount = getRoundCount,
    createEmpty = createEmpty,
    getTime = getTime
}

