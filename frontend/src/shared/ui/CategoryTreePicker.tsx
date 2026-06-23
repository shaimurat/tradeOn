import { Box, CircularProgress, Popover, Typography } from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import { useEffect, useMemo, useState, type MouseEvent } from 'react';

import type { ProductCategory } from '../../features/productCategories/model/types';
import {
  buildCategoriesByParentID,
  buildCategoryMap,
  buildCategoryNameMap,
  getCategoryCount,
  type CategoryPathItem,
} from '../../features/products/lib/productForm';

type CategoryRowProps = {
  title: string;
  count?: number | null;
  active?: boolean;
  selected?: boolean;
  hasChildren?: boolean;
  activeBg?: string;
  icon?: React.ReactNode;
  onMouseEnter?: () => void;
  onClick: () => void;
};

function CategoryRow({
  title,
  count,
  active,
  selected,
  hasChildren,
  activeBg = 'common.black',
  icon,
  onMouseEnter,
  onClick,
}: CategoryRowProps) {
  return (
    <Box
      component="button"
      type="button"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      sx={{
        width: '100%',
        minHeight: 42,
        px: 1.5,
        py: 1,
        border: 0,
        bgcolor: active ? activeBg : 'transparent',
        color: active ? 'common.white' : 'text.primary',
        cursor: 'pointer',
        display: 'grid',
        gridTemplateColumns: '1fr auto auto',
        alignItems: 'center',
        gap: 1,
        textAlign: 'left',
        transition: '0.12s ease',

        '&:hover': {
          bgcolor: 'common.black',
          color: 'common.white',
        },

        '&:hover .category-count': {
          bgcolor: 'rgba(255,255,255,0.18)',
          color: 'common.white',
        },
      }}
    >
      <Box
        sx={{
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
        }}
      >
        {icon}

        <Typography
          sx={{
            minWidth: 0,
            fontSize: 14,
            lineHeight: 1.25,
            fontWeight: 400,
          }}
        >
          {title}
        </Typography>
      </Box>

      {typeof count === 'number' && (
        <Box
          component="span"
          className="category-count"
          sx={{
            px: 0.75,
            py: 0.15,
            borderRadius: 999,
            bgcolor: active ? 'rgba(255,255,255,0.18)' : 'action.hover',
            color: active ? 'common.white' : 'text.secondary',
            fontSize: 10,
            lineHeight: 1.5,
            whiteSpace: 'nowrap',
          }}
        >
          {count}
        </Box>
      )}

      {hasChildren && <ChevronRightIcon sx={{ fontSize: 18, opacity: 0.85 }} />}
    </Box>
  );
}

type CategoryTreePickerProps = {
  label: string;
  helperText?: string;
  categories: ProductCategory[];
  selectedCategoryID: string;
  parentID: string | null;
  path: CategoryPathItem[];
  loading?: boolean;
  disabled?: boolean;
  emptyValueLabel: string;
  allowClear?: boolean;
  onParentChange: (parentID: string | null) => void;
  onPathChange: (path: CategoryPathItem[]) => void;
  onSelect: (categoryID: string) => void;
  onClear: () => void;
  onCreateCategory?: (parentID: string | null) => void;
};

export function CategoryTreePicker({
  label,
  helperText,
  categories,
  selectedCategoryID,
  parentID,
  path,
  loading,
  disabled,
  emptyValueLabel,
  allowClear = true,
  onParentChange,
  onPathChange,
  onSelect,
  onClear,
  onCreateCategory,
}: CategoryTreePickerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [hoveredRootID, setHoveredRootID] = useState<string | null>(parentID);
  const [hoveredSubcategoryID, setHoveredSubcategoryID] = useState<string | null>(null);

  const categoriesByParentID = useMemo(
    () => buildCategoriesByParentID(categories),
    [categories]
  );

  const categoryByID = useMemo(() => buildCategoryMap(categories), [categories]);

  const categoryNameByID = useMemo(
    () => buildCategoryNameMap(categories),
    [categories]
  );

  const open = Boolean(anchorEl);
  const rootCategories = categoriesByParentID.root || [];

  const hoveredRoot = hoveredRootID ? categoryByID[hoveredRootID] : null;

  const hoveredSubcategories = hoveredRootID
    ? categoriesByParentID[hoveredRootID] || []
    : [];

  const hoveredRootIndex = hoveredRootID
    ? rootCategories.findIndex((category) => category.id === hoveredRootID)
    : -1;

  const hoveredSubcategory = hoveredSubcategoryID
    ? categoryByID[hoveredSubcategoryID]
    : null;

  const hoveredNestedSubcategories = hoveredSubcategoryID
    ? categoriesByParentID[hoveredSubcategoryID] || []
    : [];

  const hoveredSubcategoryIndex = hoveredSubcategoryID
    ? hoveredSubcategories.findIndex(
        (category) => category.id === hoveredSubcategoryID
      )
    : -1;

  const selectedCategoryName = selectedCategoryID
    ? categoryNameByID[selectedCategoryID]
    : '';

  const selectedCategory = selectedCategoryID ? categoryByID[selectedCategoryID] : null;

  const selectedParentID = selectedCategory?.parent_id || null;

  const selectedGrandParentID = selectedParentID
    ? categoryByID[selectedParentID]?.parent_id || null
    : null;

  const canCreateUnderRoot = Boolean(onCreateCategory && hoveredRoot);

  const canCreateUnderSubcategory = Boolean(
    onCreateCategory && hoveredSubcategory && hoveredSubcategory.parent_id
  );

  const shouldShowSubcolumn = Boolean(
    hoveredRoot && (hoveredSubcategories.length > 0 || canCreateUnderRoot)
  );

  const shouldShowNestedSubcolumn = Boolean(
    hoveredSubcategory &&
      (hoveredNestedSubcategories.length > 0 || canCreateUnderSubcategory)
  );

  const popoverWidth = shouldShowNestedSubcolumn
    ? 840
    : shouldShowSubcolumn
      ? 560
      : 280;

  useEffect(() => {
    if (!open) {
      return;
    }

    const initialRootID =
      selectedGrandParentID || selectedParentID || parentID || path[0]?.id || null;

    const initialSubcategoryID = selectedGrandParentID ? selectedParentID : null;

    setHoveredRootID(initialRootID);
    setHoveredSubcategoryID(initialSubcategoryID);
  }, [open, parentID, path, selectedGrandParentID, selectedParentID]);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    if (disabled) {
      return;
    }

    setAnchorEl(event.currentTarget);

    if (!selectedCategoryID) {
      setHoveredRootID(null);
      setHoveredSubcategoryID(null);
      return;
    }

    const selectedCategory = categoryByID[selectedCategoryID];

    const parent = selectedCategory?.parent_id
      ? categoryByID[selectedCategory.parent_id]
      : null;

    const grandParent = parent?.parent_id ? categoryByID[parent.parent_id] : null;

    if (grandParent) {
      setHoveredRootID(grandParent.id);
      setHoveredSubcategoryID(parent?.id || null);
      return;
    }

    if (parent) {
      setHoveredRootID(parent.id);
      setHoveredSubcategoryID(null);
      return;
    }

    setHoveredRootID(selectedCategory?.id || null);
    setHoveredSubcategoryID(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setHoveredRootID(null);
    setHoveredSubcategoryID(null);
  };

  const handleSelectAll = () => {
    onClear();
    setHoveredRootID(null);
    setHoveredSubcategoryID(null);
    handleClose();
  };

  const handleCreateCategory = (parentID: string | null) => {
    onCreateCategory?.(parentID);
    handleClose();
  };

  const handleRootHover = (category: ProductCategory) => {
    setHoveredRootID(category.id);
    setHoveredSubcategoryID(null);
  };

  const handleRootClick = (category: ProductCategory) => {
    onSelect(category.id);
    onParentChange(category.id);
    onPathChange([{ id: category.id, name: category.name }]);
    handleClose();
  };

  const handleSubcategoryHover = (category: ProductCategory) => {
    setHoveredSubcategoryID(category.id);
  };

  const handleSubcategoryClick = (category: ProductCategory) => {
    const root = category.parent_id ? categoryByID[category.parent_id] : null;

    onSelect(category.id);
    onParentChange(category.parent_id || null);

    onPathChange(
      root
        ? [
            { id: root.id, name: root.name },
            { id: category.id, name: category.name },
          ]
        : [{ id: category.id, name: category.name }]
    );

    handleClose();
  };

  const handleNestedSubcategoryClick = (category: ProductCategory) => {
    const parent = category.parent_id ? categoryByID[category.parent_id] : null;
    const root = parent?.parent_id ? categoryByID[parent.parent_id] : null;

    onSelect(category.id);
    onParentChange(category.parent_id || null);

    onPathChange(
      root && parent
        ? [
            { id: root.id, name: root.name },
            { id: parent.id, name: parent.name },
            { id: category.id, name: category.name },
          ]
        : parent
          ? [
              { id: parent.id, name: parent.name },
              { id: category.id, name: category.name },
            ]
          : [{ id: category.id, name: category.name }]
    );

    handleClose();
  };

  const rowHeight = 42;

  const firstColumnOffset = allowClear ? rowHeight : 0;

  const secondColumnTop =
    hoveredRootIndex >= 0
      ? firstColumnOffset + hoveredRootIndex * rowHeight
      : 0;

  const secondColumnOffset = allowClear ? rowHeight : 0;

  const thirdColumnTop =
    secondColumnTop +
    (hoveredSubcategoryIndex >= 0
      ? secondColumnOffset + hoveredSubcategoryIndex * rowHeight
      : 0);

  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          mb: 0.5,
          color: 'text.primary',
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>

      <Box
        component="button"
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        sx={{
          width: '100%',
          height: 42,
          px: 1.5,
          border: 1,
          borderColor: open ? 'primary.main' : 'divider',
          borderRadius: 1.5,
          bgcolor: disabled ? 'action.disabledBackground' : 'background.paper',
          color: disabled ? 'text.disabled' : 'text.primary',
          cursor: disabled ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          textAlign: 'left',
          transition: '0.15s ease',
          '&:hover': {
            borderColor: disabled ? 'divider' : 'text.primary',
          },
        }}
      >
        <Typography
          noWrap
          sx={{
            fontSize: 14,
            color: selectedCategoryName ? 'text.primary' : 'text.secondary',
          }}
        >
          {selectedCategoryName || emptyValueLabel}
        </Typography>

        {loading ? (
          <CircularProgress size={18} />
        ) : (
          <ChevronRightIcon
            sx={{
              fontSize: 20,
              transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: '0.15s ease',
            }}
          />
        )}
      </Box>

      {helperText && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 0.5 }}
        >
          {helperText}
        </Typography>
      )}

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: {
                xs: 'calc(100vw - 32px)',
                sm: popoverWidth,
              },
              maxWidth: 'calc(100vw - 32px)',
              borderRadius: 1,
              boxShadow: 'none',
              bgcolor: 'transparent',
              overflow: 'visible',
            },
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: {
              xs: '100%',
              sm: popoverWidth,
            },
            maxHeight: 440,
          }}
        >
          <Box
            sx={{
              width: {
                xs: '100%',
                sm: 280,
              },
              overflowY: 'auto',
              maxHeight: 440,
              bgcolor: 'background.paper',
              borderRadius: 0,
              boxShadow: 6,
              overflow: 'hidden',
            }}
          >
            {allowClear && (
              <CategoryRow
                title={emptyValueLabel}
                active={!hoveredRootID}
                selected={false}
                onMouseEnter={() => {
                  setHoveredRootID(null);
                  setHoveredSubcategoryID(null);
                }}
                onClick={handleSelectAll}
              />
            )}

            {rootCategories.map((category) => {
              const count = getCategoryCount(category);

              const hasChildren = Boolean(
                categoriesByParentID[category.id]?.length || onCreateCategory
              );

              const isActive = hoveredRootID === category.id;

              return (
                <CategoryRow
                  key={category.id}
                  title={category.name}
                  count={count}
                  active={isActive}
                  selected={false}
                  hasChildren={hasChildren}
                  onMouseEnter={() => handleRootHover(category)}
                  onClick={() => handleRootClick(category)}
                />
              );
            })}

            {onCreateCategory && (
              <CategoryRow
                title="Создать корневую категорию"
                icon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                onMouseEnter={() => {
                  setHoveredRootID(null);
                  setHoveredSubcategoryID(null);
                }}
                onClick={() => handleCreateCategory(null)}
              />
            )}
          </Box>

          {shouldShowSubcolumn && hoveredRoot && (
            <Box
              sx={{
                position: {
                  xs: 'static',
                  sm: 'absolute',
                },
                left: {
                  sm: 280,
                },
                top: {
                  sm: secondColumnTop,
                },
                width: {
                  xs: '100%',
                  sm: 280,
                },
                overflowY: 'auto',
                maxHeight: {
                  xs: 260,
                  sm: 440,
                },
                bgcolor: 'background.paper',
                borderRadius: 0,
                boxShadow: 6,
                overflow: 'hidden',
              }}
            >
              {allowClear && (
                <CategoryRow
                  title={`Все в ${hoveredRoot.name}`}
                  active={false}
                  selected={false}
                  onMouseEnter={() => setHoveredSubcategoryID(null)}
                  onClick={() => handleRootClick(hoveredRoot)}
                />
              )}

              {hoveredSubcategories.map((category) => {
                const hasChildren = Boolean(
                  categoriesByParentID[category.id]?.length || onCreateCategory
                );

                const isActive = hoveredSubcategoryID === category.id;

                return (
                  <CategoryRow
                    key={category.id}
                    title={category.name}
                    count={getCategoryCount(category)}
                    active={isActive}
                    selected={false}
                    hasChildren={hasChildren}
                    onMouseEnter={() => handleSubcategoryHover(category)}
                    onClick={() => handleSubcategoryClick(category)}
                  />
                );
              })}

              {onCreateCategory && (
                <CategoryRow
                  title={`Создать подкатегорию в ${hoveredRoot.name}`}
                  icon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                  onMouseEnter={() => setHoveredSubcategoryID(null)}
                  onClick={() => handleCreateCategory(hoveredRoot.id)}
                />
              )}
            </Box>
          )}

          {shouldShowNestedSubcolumn && hoveredSubcategory && (
            <Box
              sx={{
                position: {
                  xs: 'static',
                  sm: 'absolute',
                },
                left: {
                  sm: 560,
                },
                top: {
                  sm: thirdColumnTop,
                },
                width: {
                  xs: '100%',
                  sm: 280,
                },
                overflowY: 'auto',
                maxHeight: {
                  xs: 260,
                  sm: 440,
                },
                bgcolor: 'background.paper',
                borderRadius: 0,
                boxShadow: 6,
                overflow: 'hidden',
              }}
            >
              {allowClear && (
                <CategoryRow
                  title={`Все в ${hoveredSubcategory.name}`}
                  active={false}
                  selected={false}
                  onClick={() => handleSubcategoryClick(hoveredSubcategory)}
                />
              )}

              {hoveredNestedSubcategories.map((category) => (
                <CategoryRow
                  key={category.id}
                  title={category.name}
                  count={getCategoryCount(category)}
                  active={false}
                  selected={false}
                  onClick={() => handleNestedSubcategoryClick(category)}
                />
              ))}

              {canCreateUnderSubcategory && (
                <CategoryRow
                  title={`Создать подкатегорию в ${hoveredSubcategory.name}`}
                  icon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                  onClick={() => handleCreateCategory(hoveredSubcategory.id)}
                />
              )}
            </Box>
          )}
        </Box>
      </Popover>
    </Box>
  );
}