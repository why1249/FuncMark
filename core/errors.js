/**
 * 标准错误代码与辅助构造
 */
const ErrorCodes = {
  UNKNOWN_FUNCTION: 'FM001',
  PARAM_FORMAT_ERROR: 'FM002',
  UNCLOSED_PAREN: 'FM003',
  SYNTAX_ERROR: 'FM000'
};

function buildError(code, message, loc = null, hint = '') {
  return {
    type: 'error',
    code,
    message,
    hint,
    loc
  };
}

module.exports = { ErrorCodes, buildError };
