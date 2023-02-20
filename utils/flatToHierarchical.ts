import MenuItem from "@/lib/types/MenuItem";

function compareOrder(a: MenuItem, b: MenuItem): number {
    if (a.order > b.order) return 1;
    if (a.order < b.order) return -1;
    return 0;
  }
  
  function sortHierarchical(tab: MenuItem[]) {
    return tab.sort(compareOrder).map(item => {
      if(item?.children?.length > 0) {
        item.children = sortHierarchical(item.children);
      }
      return item;
    })
  }

const flatListToHierarchical = (
    data = [],
    {idKey='_id',parentKey='parent',childrenKey='children'} = {}
  ): MenuItem[] => {
    const tree:MenuItem[] = [];
    const childrenOf:any = {};
    data.forEach((item:MenuItem) => {
        const newItem:any = {...item};
        const { [idKey]: id, [parentKey]: parentId = 0 } = newItem;
        childrenOf[id] = childrenOf[id] || [];
        newItem[childrenKey] = childrenOf[id];
        parentId
            ? (
                childrenOf[parentId] = childrenOf[parentId] || []
            ).push(newItem)
            : tree.push(newItem);
    });
    return sortHierarchical(tree);
};

export default flatListToHierarchical;