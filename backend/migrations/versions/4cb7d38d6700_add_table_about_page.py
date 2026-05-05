"""Add table about page

Revision ID: 4cb7d38d6700
Revises: 34c8e27beb48
Create Date: 2026-05-03 17:07:54.732498

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4cb7d38d6700'
down_revision: Union[str, None] = '34c8e27beb48'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
