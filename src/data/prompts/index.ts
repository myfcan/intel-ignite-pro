import { emailPromptsCategory } from './email-prompts';
import { blogPromptsCategory } from './blog-prompts';
import { studyPromptsCategory } from './study-prompts';
import { contentPromptsCategory } from './content-prompts';
import { socialPromptsCategory } from './social-prompts';
import { seoPromptsCategory } from './seo-prompts';
import { extraIncomePromptsCategory } from './extra-income-prompts';
import { dailyLifePromptsCategory } from './daily-life-prompts';
import { freePromptsCategory } from './free-prompts';
import { marketingDigitalPromptsCategory } from './marketing-digital-prompts';
import { businessPromptsCategory } from './business-complete';
import { personalFinancePromptsCategory } from './personal-finance-complete';
import { productCreationPromptsCategory } from './product-creation-complete';
import { salesMarketingPromptsCategory } from './sales-marketing-complete';
import { marketingDigitalPremiumPrompts, businessPremiumPrompts } from './premium-prompts-pack1';
import { premiumPromptsPack2 } from './premium-prompts-pack2';
import { PromptCategory, Prompt } from '../../types/prompt';

// Combinar prompts premium com suas categorias
const enhancedMarketingDigitalCategory: PromptCategory = {
  ...marketingDigitalPromptsCategory,
  prompts: [...marketingDigitalPromptsCategory.prompts, ...marketingDigitalPremiumPrompts]
};

const enhancedBusinessCategory: PromptCategory = {
  ...businessPromptsCategory,
  prompts: [...businessPromptsCategory.prompts, ...businessPremiumPrompts]
};

const enhancedPersonalFinanceCategory: PromptCategory = {
  ...personalFinancePromptsCategory,
  prompts: [...personalFinancePromptsCategory.prompts, ...premiumPromptsPack2.filter(p => p.categoryId === 'personal-finance')]
};

const enhancedProductCreationCategory: PromptCategory = {
  ...productCreationPromptsCategory,
  prompts: [...productCreationPromptsCategory.prompts, ...premiumPromptsPack2.filter(p => p.categoryId === 'product-creation')]
};

// CATEGORIAS PRINCIPAIS
export const mainPromptCategories: PromptCategory[] = [
  enhancedMarketingDigitalCategory,
  enhancedBusinessCategory,
  enhancedPersonalFinanceCategory,
  enhancedProductCreationCategory,
  salesMarketingPromptsCategory,
  extraIncomePromptsCategory,
  dailyLifePromptsCategory,
  freePromptsCategory
];

// Export all prompt categories
export const allPromptCategories: PromptCategory[] = [
  enhancedMarketingDigitalCategory,
  enhancedBusinessCategory,
  enhancedPersonalFinanceCategory,
  enhancedProductCreationCategory,
  salesMarketingPromptsCategory,
  extraIncomePromptsCategory,
  freePromptsCategory,
  dailyLifePromptsCategory,
  emailPromptsCategory,
  blogPromptsCategory,
  studyPromptsCategory,
  contentPromptsCategory,
  socialPromptsCategory,
  seoPromptsCategory
];

// Export individual categories for direct import
export {
  emailPromptsCategory,
  blogPromptsCategory,
  studyPromptsCategory,
  contentPromptsCategory,
  socialPromptsCategory,
  seoPromptsCategory,
  marketingDigitalPromptsCategory,
  businessPromptsCategory,
  personalFinancePromptsCategory,
  productCreationPromptsCategory,
  salesMarketingPromptsCategory
};

// Helper functions

/**
 * Get all prompts from all categories
 */
export const getAllPrompts = (): Prompt[] => {
  return allPromptCategories.flatMap(category => category.prompts);
};

/**
 * Get prompts by category ID
 */
export const getPromptsByCategory = (categoryId: string): Prompt[] => {
  const category = allPromptCategories.find(cat => cat.id === categoryId);
  return category?.prompts || [];
};

/**
 * Get a specific prompt by ID
 */
export const getPromptById = (promptId: string): Prompt | undefined => {
  return getAllPrompts().find(prompt => prompt.id === promptId);
};

/**
 * Get featured prompts (marked as isFeatured)
 */
export const getFeaturedPrompts = (): Prompt[] => {
  return getAllPrompts().filter(prompt => prompt.isFeatured);
};

/**
 * Get premium prompts (marked as isPremium)
 */
export const getPremiumPrompts = (): Prompt[] => {
  return getAllPrompts().filter(prompt => prompt.isPremium);
};

/**
 * Get free prompts (not premium)
 */
export const getFreePrompts = (): Prompt[] => {
  return getAllPrompts().filter(prompt => !prompt.isPremium);
};

/**
 * Get popular categories (marked as isPopular)
 */
export const getPopularCategories = (): PromptCategory[] => {
  return allPromptCategories.filter(category => category.isPopular);
};

/**
 * Search prompts by keyword
 */
export const searchPrompts = (query: string): Prompt[] => {
  const lowercaseQuery = query.toLowerCase();
  return getAllPrompts().filter(prompt =>
    prompt.title.toLowerCase().includes(lowercaseQuery) ||
    prompt.description.toLowerCase().includes(lowercaseQuery) ||
    prompt.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

/**
 * Get prompts by difficulty
 */
export const getPromptsByDifficulty = (difficulty: 'beginner' | 'intermediate' | 'advanced'): Prompt[] => {
  return getAllPrompts().filter(prompt => prompt.difficulty === difficulty);
};

/**
 * Get prompts by tags
 */
export const getPromptsByTag = (tag: string): Prompt[] => {
  return getAllPrompts().filter(prompt =>
    prompt.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
};

/**
 * Get most used prompts (sorted by usageCount)
 */
export const getMostUsedPrompts = (limit: number = 10): Prompt[] => {
  return getAllPrompts()
    .filter(prompt => prompt.usageCount && prompt.usageCount > 0)
    .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
    .slice(0, limit);
};

/**
 * Get prompt statistics
 */
export const getPromptStats = () => {
  const allPrompts = getAllPrompts();
  return {
    totalCategories: allPromptCategories.length,
    totalPrompts: allPrompts.length,
    freePrompts: allPrompts.filter(p => !p.isPremium).length,
    premiumPrompts: allPrompts.filter(p => p.isPremium).length,
    featuredPrompts: allPrompts.filter(p => p.isFeatured).length,
    beginnerPrompts: allPrompts.filter(p => p.difficulty === 'beginner').length,
    intermediatePrompts: allPrompts.filter(p => p.difficulty === 'intermediate').length,
    advancedPrompts: allPrompts.filter(p => p.difficulty === 'advanced').length,
    totalUsage: allPrompts.reduce((sum, p) => sum + (p.usageCount || 0), 0)
  };
};
