"""Add table about page 0.2

Revision ID: 99bf48306816
Revises: 4cb7d38d6700
Create Date: 2026-05-03 17:22:24.566418

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '99bf48306816'
down_revision: Union[str, None] = '4cb7d38d6700'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
