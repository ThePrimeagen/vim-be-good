local log = require("vim-be-good.log")
local default_config =  {
    plugin = 'VimBeGoodStats',

    save_statistics = vim.g["vim_be_good_save_statistics"] or false,

}

local statistics = {}

function statistics:new(config)
    config = config or {}
    config = vim.tbl_deep_extend("force", default_config, config)

    local stats = {
        file = string.format('%s/%s_%s.log', vim.api.nvim_call_function('stdpath', {'data'}), config.plugin, "rounds"),
        gameLogFile = string.format('%s/%s_%s.log', vim.api.nvim_call_function('stdpath', {'data'}), config.plugin, "games"),
        saveStats = config.save_statistics
    }
    self.__index = self
    return setmetatable(stats, self)
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

function statistics:logGameResult(result)
    if self.saveStats then
        local fp = io.open(self.gameLogFile, "a")
        local str = string.format("%s,%s,%s,%f,%f,%f,%f,%f\n",
        result.timestamp, result.gameName, result.difficulty, result.successRate, result.meanTime, result.sstdDevTime, result.minTime, result.maxTime)
        fp:write(str)
        fp:close()
    end
end
return statistics
