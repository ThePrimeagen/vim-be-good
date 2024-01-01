local log = require("vim-be-good.log")
local types = require("vim-be-good.types")
local default_config =  {
    plugin = 'VimBeGoodStats',
    save_statistics = vim.g["vim_be_good_save_statistics"] or false,
}

local statistics = {}
function statistics:new(config)
    config = config or {}
    config = vim.tbl_deep_extend("force", default_config, config)

    local stats = {
        file = string.format('%s/%s.log', vim.api.nvim_call_function('stdpath', {'data'}), config.plugin),
        saveStats = config.save_statistics
    }
    self.__index = self
    return setmetatable(stats, self)
end
function statistics:loadHighscore()
    local out = io.open(self.file, 'r')

    local fLines = {}
    for l in out:lines() do
        table.insert(fLines, l)
    end

    out:close()

    local t = {}
    t = {}
    for k, v in string.gmatch(fLines[1], "(%w+{*):(%d+%.%d+)") do
        t[k] = v
    end
    return t
end

function statistics:logHighscore(average,gameType)
    if self.saveStats then
        local out = io.open(self.file, 'r')

        local fLines = {}
        for l in out:lines() do
            table.insert(fLines, l)
        end

        out:close()

        -- check if new highscore is lower then current highsocre
        -- \\todo do not overwrite first line
        -- \\todo check if game is already in highscore if not add it 
        local currHighscore = (string.match(fLines[1],gameType..":".."(%d+%.%d%d)"))
        if tonumber(currHighscore) > average then
            fLines[1] = string.gsub(fLines[1],gameType..":"..currHighscore,gameType..":"..string.format("%.2f",average))
        end

        local out = io.open(self.file, 'w')
        for _, l in ipairs(fLines) do
            out:write(l.."\n")
            -- out:write("\n") -- strage when I read the file break line should still be present  
        end
        out:close()
    end
end

function statistics:logResult(result)
    if self.saveStats then
        local fp = io.open(self.file, "a")
        local str = string.format("%s,%s,%s,%s,%s,%f\n",
        result.timestamp, result.roundNum, result.difficulty, result.roundName, result.success, result.time)
        fp:write(str)
        fp:close()
    end
end

return statistics
