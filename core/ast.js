/**
 * AST 基础节点定义（占位）
 */
class ASTNode {
  constructor(type, props = {}, loc = null) {
    this.type = type;
    this.props = props;
    this.loc = loc;
  }
}

/**
 * 构建简易 AST：与旧结构接近：Heading/Paragraph/List/Code/Error -> 统一节点结构。
 */
function buildNode(type, props, loc) {
  return new ASTNode(type, props, loc);
}

module.exports = { ASTNode, buildNode };

