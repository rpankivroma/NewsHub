from .user import User, UserCreate, UserVerify, UserLogin, UserResendCode, ForgotPasswordRequest, ResetPasswordRequest, UserUpdate, AdminWithStats, AdminWithStatsList, AdminReportRequest
from .category import Category, CategoryCreate
from .article_schema import Article, ArticleCreate, ArticleUpdate
from .comment import Comment, CommentCreate
from .submission_schema import Submission, SubmissionCreate, SubmissionUpdate, SubmissionUserUpdate
from .token import Token, TokenData
from .donation_settings import DonationSettings, DonationSettingsCreate
from .donation import Donation, DonationCreate
from .about_page import AboutPage, AboutPageCreate
from .analytics import VisitCreate, AdminLog, AdminLogList

# This allows importing all schemas from backend.app.schemas
__all__ = [
    "User", "UserCreate", "UserVerify", "UserLogin", "UserResendCode", "ForgotPasswordRequest", "ResetPasswordRequest", "UserUpdate", "AdminWithStats", "AdminWithStatsList", "AdminReportRequest",
    "Category", "CategoryCreate", 
    "Article", "ArticleCreate", "ArticleUpdate",
    "Comment", "CommentCreate", 
    "Submission", "SubmissionCreate", "SubmissionUpdate",
    "Token", "TokenData",
    "DonationSettings", "DonationSettingsCreate",
    "Donation", "DonationCreate",
    "AboutPage", "AboutPageCreate",
    "VisitCreate", "AdminLog", "AdminLogList"
]
