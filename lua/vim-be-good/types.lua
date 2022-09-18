local CiRound = require("vim-be-good.games.ci");
local RelativeRound = require("vim-be-good.games.relative");
local HjklRound = require("vim-be-good.games.hjkl");
local WhackAMoleRound = require("vim-be-good.games.whackamole");

local difficulty = {
    "noob",
    "easy",
    "medium",
    "hard",
    "nightmare",
    "tpope",
}

local games = {
}
if (vim.g["vim_be_good_disable_ci{"] or true) then
    games["ci{"] = CiRound
end
if (vim.g["vim_be_good_disable_relative"] or true) then
    games["relative"] = RelativeRound
end
if (vim.g["vim_be_good_disable_hjkl"] or true) then
    games["hjkl"] = HjklRound
end
if (vim.g["vim_be_good_disable_whackamole"] or true) then
    games["whackamole"] = WhackAMoleRound
end


return {
    difficulty = difficulty,
    games = games
}

